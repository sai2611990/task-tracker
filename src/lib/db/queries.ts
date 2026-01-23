import { createClient } from '@/lib/supabase/client';

// Fetch all companies
export async function getCompanies() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
  return data;
}

// Fetch departments with company info
export async function getDepartments(companyId?: string) {
  const supabase = createClient();
  let query = supabase
    .from('departments')
    .select('*, company:companies(id, name, color)')
    .order('name');

  if (companyId) {
    query = query.eq('company_id', companyId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
  return data;
}

// Fetch tasks with project and company info
export async function getTasks(filters?: {
  companyId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const supabase = createClient();
  let query = supabase
    .from('tasks')
    .select(`
      *,
      project:projects(
        id,
        name,
        company:companies(id, name, color),
        department:departments(id, name, color)
      )
    `)
    .order('due_date');

  if (filters?.startDate) {
    query = query.gte('due_date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('due_date', filters.endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  return data;
}

// Fetch projects
export async function getProjects(companyId?: string) {
  const supabase = createClient();
  let query = supabase
    .from('projects')
    .select(`
      *,
      company:companies(id, name, color),
      department:departments(id, name, color)
    `)
    .order('name');

  if (companyId) {
    query = query.eq('company_id', companyId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return data;
}

// Fetch department targets
export async function getDepartmentTargets(departmentId?: string) {
  const supabase = createClient();
  let query = supabase
    .from('department_targets')
    .select(`
      *,
      department:departments(id, name, color, company:companies(id, name))
    `)
    .order('created_at', { ascending: false });

  if (departmentId) {
    query = query.eq('department_id', departmentId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching targets:', error);
    return [];
  }
  return data;
}

// Get stats for dashboard
export async function getDashboardStats() {
  const supabase = createClient();

  const [companies, tasks, targets] = await Promise.all([
    supabase.from('companies').select('id', { count: 'exact' }),
    supabase.from('tasks').select('id, status', { count: 'exact' }),
    supabase.from('department_targets').select('id, status', { count: 'exact' }),
  ]);

  return {
    totalCompanies: companies.count || 0,
    totalTasks: tasks.count || 0,
    totalTargets: targets.count || 0,
    tasks: tasks.data || [],
    targets: targets.data || [],
  };
}
