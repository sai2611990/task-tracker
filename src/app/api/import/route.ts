import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

interface ParsedTask {
  title: string;
  department: string;
  month: string;
  period: string;
  startDate: Date;
  endDate: Date;
}

// Parse the NOVA PLAN CSV format
function parseNovaPlanCSV(csvContent: string): ParsedTask[] {
  const lines = csvContent.split('\n').map(line =>
    line.split(',').map(cell => cell.trim().replace(/^\"|\"$/g, '').replace(/^\uFEFF/, ''))
  );

  // Row 2 (index 1) contains department headers
  // Columns: 0=Month, 1=Period, 2=Empty, 3+=Departments
  const headerRow = lines[1] || [];

  // Map column index to department name (starting from index 3)
  const columnToDepartment: Record<number, string> = {};
  headerRow.forEach((header, index) => {
    if (header && header.length > 0 && index >= 3) {
      columnToDepartment[index] = header;
    }
  });

  console.log('Found departments:', Object.values(columnToDepartment).slice(0, 10));

  const tasks: ParsedTask[] = [];
  let currentMonth = '';
  const currentYear = 2026; // Current year for timeline visibility

  // Process data rows (starting from row 3, index 2)
  for (let rowIndex = 2; rowIndex < lines.length; rowIndex++) {
    const row = lines[rowIndex];
    if (!row || row.length < 3) continue;

    // Check if first column has a month
    if (row[0] && ['JAN', 'FEB', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'].includes(row[0].toUpperCase())) {
      currentMonth = row[0].toUpperCase();
    }

    // Get the period (e.g., "1 TO 10", "10 TO 20", "20 TO 30")
    const period = row[1] || '';
    if (!period || !period.includes('TO')) continue;

    // Parse period to get date range
    const [startDay, , endDay] = period.split(' ').map(s => parseInt(s) || 0);
    if (!startDay || !currentMonth) continue;

    const monthMap: Record<string, number> = {
      'JAN': 0, 'FEB': 1, 'MARCH': 2, 'APRIL': 3, 'MAY': 4, 'JUNE': 5,
      'JULY': 6, 'AUG': 7, 'SEPT': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
    };

    const monthIndex = monthMap[currentMonth];
    if (monthIndex === undefined) continue;

    const startDate = new Date(currentYear, monthIndex, startDay);
    const endDate = new Date(currentYear, monthIndex, endDay || startDay + 9);

    // Process each column (department) - starting from index 3
    for (let colIndex = 3; colIndex < row.length; colIndex++) {
      const cellValue = row[colIndex]?.trim();
      if (!cellValue || cellValue.length === 0) continue;

      const department = columnToDepartment[colIndex];
      if (!department) continue;

      tasks.push({
        title: cellValue,
        department,
        month: currentMonth,
        period,
        startDate,
        endDate,
      });
    }
  }

  return tasks;
}

// Group departments into categories
function categorizeDepatment(dept: string): { category: string; color: string } {
  const deptLower = dept.toLowerCase();

  if (deptLower.includes('it ') || deptLower.startsWith('it')) {
    return { category: 'IT', color: '#3B82F6' }; // Blue
  }
  if (deptLower.includes('training') || deptLower.includes('trainees')) {
    return { category: 'Training', color: '#10B981' }; // Green
  }
  if (deptLower.includes('sales') || deptLower.includes('marketing')) {
    return { category: 'Sales', color: '#F59E0B' }; // Amber
  }
  if (deptLower.includes('support') || deptLower.includes('permitting')) {
    return { category: 'Support', color: '#8B5CF6' }; // Purple
  }
  if (deptLower.includes('india') || deptLower.includes('china') || deptLower.includes('usa')) {
    return { category: 'Manufacturing', color: '#EF4444' }; // Red
  }
  if (deptLower.includes('deck') || deptLower.includes('fundraising') || deptLower.includes('pitch')) {
    return { category: 'Fundraising', color: '#EC4899' }; // Pink
  }
  if (deptLower.includes('location') || deptLower.includes('install')) {
    return { category: 'Operations', color: '#14B8A6' }; // Teal
  }

  return { category: 'General', color: '#6B7280' }; // Gray
}

export async function POST(request: NextRequest) {
  try {
    // Try admin client first (for service role access), fall back to user client
    let supabase;
    try {
      supabase = createAdminClient();
    } catch {
      // Fall back to user's session
      supabase = await createClient();
    }

    // Get the CSV content from request
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const csvContent = formData.get('csvContent') as string | null;

    let content: string;

    if (file) {
      content = await file.text();
    } else if (csvContent) {
      content = csvContent;
    } else {
      return NextResponse.json({ error: 'No file or content provided' }, { status: 400 });
    }

    // Parse the CSV
    const parsedTasks = parseNovaPlanCSV(content);
    console.log('Parsed tasks count:', parsedTasks.length);
    if (parsedTasks.length > 0) {
      console.log('Sample task:', parsedTasks[0]);
    }

    if (parsedTasks.length === 0) {
      return NextResponse.json({ error: 'No tasks found in CSV' }, { status: 400 });
    }

    // Get or create NovaCube company
    let { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('name', 'NovaCube')
      .single();

    if (!company) {
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({ name: 'NovaCube', industry: 'Technology', color: '#3B82F6' })
        .select('id')
        .single();

      if (companyError) throw companyError;
      company = newCompany;
    }

    // Get unique departments and create them
    const uniqueDepartments = [...new Set(parsedTasks.map(t => t.department))];
    const departmentMap: Record<string, string> = {};

    for (const deptName of uniqueDepartments) {
      // Check if department exists
      let { data: dept } = await supabase
        .from('departments')
        .select('id')
        .eq('name', deptName)
        .eq('company_id', company.id)
        .single();

      if (!dept) {
        const { category, color } = categorizeDepatment(deptName);
        const { data: newDept, error: deptError } = await supabase
          .from('departments')
          .insert({
            name: deptName,
            company_id: company.id,
            color
          })
          .select('id')
          .single();

        if (deptError) {
          console.error('Error creating department:', deptError);
          continue;
        }
        dept = newDept;
      }

      if (dept) {
        departmentMap[deptName] = dept.id;
      }
    }

    // Create projects for each department
    const projectMap: Record<string, string> = {};

    for (const [deptName, deptId] of Object.entries(departmentMap)) {
      const projectName = `${deptName} - Q1 2025`;

      let { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('name', projectName)
        .eq('company_id', company.id)
        .single();

      if (!project) {
        const { data: newProject, error: projectError } = await supabase
          .from('projects')
          .insert({
            name: projectName,
            company_id: company.id,
            department_id: deptId,
            status: 'active',
            start_date: '2025-01-01',
            end_date: '2025-06-30',
          })
          .select('id')
          .single();

        if (projectError) {
          console.error('Error creating project:', projectError);
          continue;
        }
        project = newProject;
      }

      if (project) {
        projectMap[deptName] = project.id;
      }
    }

    // Create tasks
    const tasksToInsert = parsedTasks
      .filter(task => projectMap[task.department])
      .map(task => ({
        title: task.title,
        project_id: projectMap[task.department],
        status: task.startDate < new Date() ? 'in_progress' : 'todo',
        priority: 'medium',
        due_date: task.endDate.toISOString().split('T')[0],
        is_checkpoint: task.title.toLowerCase().includes('final') ||
                       task.title.toLowerCase().includes('cert') ||
                       task.title.toLowerCase().includes('prod') ||
                       task.title.toLowerCase().includes('go live'),
      }));

    // Insert tasks in batches
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < tasksToInsert.length; i += batchSize) {
      const batch = tasksToInsert.slice(i, i + batchSize);
      const { error: taskError } = await supabase
        .from('tasks')
        .insert(batch);

      if (taskError) {
        console.error('Error inserting tasks batch:', taskError);
      } else {
        insertedCount += batch.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${insertedCount} tasks from ${uniqueDepartments.length} departments`,
      stats: {
        totalTasks: insertedCount,
        departments: uniqueDepartments.length,
        projects: Object.keys(projectMap).length,
      }
    });

  } catch (error) {
    console.error('Import error:', error);
    const errorMessage = error instanceof Error
      ? error.message
      : typeof error === 'object'
        ? JSON.stringify(error)
        : String(error);
    return NextResponse.json(
      { error: 'Failed to import CSV', details: errorMessage },
      { status: 500 }
    );
  }
}
