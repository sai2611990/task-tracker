import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
let anthropic: Anthropic | null = null;
let supabase: SupabaseClient | null = null;

function getAnthropicClient() {
  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
}

function getSupabaseClient() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

// Department templates - auto-created when a company is created
const DEPARTMENT_TEMPLATES = [
  'IT Department',
  'Manufacturing',
  'Operations',
  'Training',
  'Sales',
  'Marketing',
  'Support',
  'R&D',
  'Investor Relations',
  'Human Resources',
];

// Tool definitions for Claude
const tools: Anthropic.Tool[] = [
  {
    name: 'list_companies',
    description: 'Get a list of all companies',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'create_company',
    description: 'Create a new company with auto-generated departments. Use this when user wants to add a new company.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Company name' },
        short_name: { type: 'string', description: '2-3 letter abbreviation' },
        industry: { type: 'string', description: 'Industry type' },
        color: { type: 'string', description: 'Brand color in hex format (e.g., #3B82F6)' },
      },
      required: ['name', 'short_name'],
    },
  },
  {
    name: 'list_departments',
    description: 'Get departments, optionally filtered by company',
    input_schema: {
      type: 'object' as const,
      properties: {
        company_id: { type: 'string', description: 'Optional company ID to filter by' },
      },
      required: [],
    },
  },
  {
    name: 'list_tasks',
    description: 'Get timeline tasks, optionally filtered by department or status',
    input_schema: {
      type: 'object' as const,
      properties: {
        department_id: { type: 'string', description: 'Optional department ID' },
        status: { type: 'string', description: 'Optional status filter' },
      },
      required: [],
    },
  },
  {
    name: 'create_task',
    description: 'Create a new timeline task',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Task name' },
        department_id: { type: 'string', description: 'Department ID' },
        start_period: { type: 'number', description: 'Start period (0-35)' },
        end_period: { type: 'number', description: 'End period (1-36)' },
        status: { type: 'string', description: 'planning, in_progress, completed, or blocked' },
        skill: { type: 'string', description: 'product_lead, builder, growth_lead, or coordinator' },
      },
      required: ['name', 'department_id', 'start_period', 'end_period'],
    },
  },
  {
    name: 'update_task',
    description: 'Update a task (move it, change status, assign it)',
    input_schema: {
      type: 'object' as const,
      properties: {
        task_id: { type: 'string', description: 'Task ID to update' },
        name: { type: 'string', description: 'New task name' },
        start_period: { type: 'number', description: 'New start period' },
        end_period: { type: 'number', description: 'New end period' },
        status: { type: 'string', description: 'New status' },
        assigned_to: { type: 'string', description: 'User ID to assign to' },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'get_team_bandwidth',
    description: 'Get team members with their current task load to find who has bandwidth for new tasks',
    input_schema: {
      type: 'object' as const,
      properties: {
        skill: { type: 'string', description: 'Filter by skill type' },
      },
      required: [],
    },
  },
  {
    name: 'smart_assign_task',
    description: 'Intelligently assign a task to the team member with the most bandwidth and matching skill',
    input_schema: {
      type: 'object' as const,
      properties: {
        task_id: { type: 'string', description: 'Task ID to assign' },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'delete_task',
    description: 'Delete a task',
    input_schema: {
      type: 'object' as const,
      properties: {
        task_id: { type: 'string', description: 'Task ID to delete' },
      },
      required: ['task_id'],
    },
  },
  {
    name: 'delete_company',
    description: 'Delete a company and all its departments and tasks',
    input_schema: {
      type: 'object' as const,
      properties: {
        company_id: { type: 'string', description: 'Company ID to delete' },
      },
      required: ['company_id'],
    },
  },
];

// Tool execution functions
async function executeTools(toolName: string, toolInput: Record<string, unknown>): Promise<string> {
  const db = getSupabaseClient();

  try {
    switch (toolName) {
      case 'list_companies': {
        const { data, error } = await db.from('companies').select('*').order('name');
        if (error) throw error;
        return JSON.stringify(data, null, 2);
      }

      case 'create_company': {
        const { name, short_name, industry, color } = toolInput as {
          name: string;
          short_name: string;
          industry?: string;
          color?: string;
        };

        // Create company
        const { data: company, error: companyError } = await db
          .from('companies')
          .insert({
            name,
            short_name: short_name.toUpperCase(),
            industry: industry || 'Technology',
            color: color || '#3B82F6',
            bg_color: (color || '#3B82F6') + '15',
          })
          .select()
          .single();

        if (companyError) throw companyError;

        // Auto-create all departments
        const departments = DEPARTMENT_TEMPLATES.map(deptName => ({
          name: deptName,
          company_id: company.id,
          color: company.color,
        }));

        const { error: deptError } = await db.from('departments').insert(departments);
        if (deptError) throw deptError;

        return `Created company "${name}" (${short_name}) with ${DEPARTMENT_TEMPLATES.length} departments: ${DEPARTMENT_TEMPLATES.join(', ')}`;
      }

      case 'list_departments': {
        const { company_id } = toolInput as { company_id?: string };
        let query = db.from('departments').select('*, companies(name, short_name)');
        if (company_id) query = query.eq('company_id', company_id);
        const { data, error } = await query.order('name');
        if (error) throw error;
        return JSON.stringify(data, null, 2);
      }

      case 'list_tasks': {
        const { department_id, status } = toolInput as { department_id?: string; status?: string };
        let query = db.from('timeline_tasks').select('*, departments(name, companies(name))');
        if (department_id) query = query.eq('department_id', department_id);
        if (status) query = query.eq('status', status);
        const { data, error } = await query.order('start_period');
        if (error) throw error;
        return JSON.stringify(data, null, 2);
      }

      case 'create_task': {
        const { name, department_id, start_period, end_period, status, skill } = toolInput as {
          name: string;
          department_id: string;
          start_period: number;
          end_period: number;
          status?: string;
          skill?: string;
        };

        const { data, error } = await db
          .from('timeline_tasks')
          .insert({
            name,
            department_id,
            start_period,
            end_period,
            status: status || 'planning',
            skill: skill || 'builder',
            year: 2026,
          })
          .select()
          .single();

        if (error) throw error;
        return `Created task "${name}" from period ${start_period} to ${end_period}`;
      }

      case 'update_task': {
        const { task_id, ...updates } = toolInput as {
          task_id: string;
          name?: string;
          start_period?: number;
          end_period?: number;
          status?: string;
          assigned_to?: string;
        };

        // Get original task for notification
        const { data: originalTask } = await db
          .from('timeline_tasks')
          .select('*, departments(name)')
          .eq('id', task_id)
          .single();

        const { data, error } = await db
          .from('timeline_tasks')
          .update(updates)
          .eq('id', task_id)
          .select()
          .single();

        if (error) throw error;

        // Build notification message
        let notification = `Updated task "${data.name}"`;
        if (updates.status) notification += ` - Status changed to ${updates.status}`;
        if (updates.assigned_to) notification += ` - Assigned to new team member`;
        if (updates.start_period !== undefined || updates.end_period !== undefined) {
          notification += ` - Timeline moved`;
        }

        return notification;
      }

      case 'get_team_bandwidth': {
        const { skill } = toolInput as { skill?: string };

        // Get all team members (from profiles)
        let query = db.from('profiles').select('id, name, email, skill, team_role');
        if (skill) query = query.eq('skill', skill);
        const { data: members, error: membersError } = await query;
        if (membersError) throw membersError;

        if (!members || members.length === 0) {
          return 'No team members found. You may need to add team members to the profiles table.';
        }

        // Get task counts per member
        const { data: tasks } = await db
          .from('timeline_tasks')
          .select('assigned_to')
          .in('status', ['planning', 'in_progress']);

        const taskCounts: Record<string, number> = {};
        tasks?.forEach(t => {
          if (t.assigned_to) {
            taskCounts[t.assigned_to] = (taskCounts[t.assigned_to] || 0) + 1;
          }
        });

        const bandwidth = members.map(m => ({
          ...m,
          active_tasks: taskCounts[m.id] || 0,
          available: !taskCounts[m.id] || taskCounts[m.id] < 5,
        })).sort((a, b) => a.active_tasks - b.active_tasks);

        return JSON.stringify(bandwidth, null, 2);
      }

      case 'smart_assign_task': {
        const { task_id } = toolInput as { task_id: string };

        // Get the task
        const { data: task, error: taskError } = await db
          .from('timeline_tasks')
          .select('*')
          .eq('id', task_id)
          .single();

        if (taskError) throw taskError;

        // Get team members with matching skill
        const { data: members } = await db
          .from('profiles')
          .select('id, name, skill')
          .eq('skill', task.skill);

        if (!members || members.length === 0) {
          return `No team members found with skill "${task.skill}". Please add team members first.`;
        }

        // Get task counts
        const { data: tasks } = await db
          .from('timeline_tasks')
          .select('assigned_to')
          .in('status', ['planning', 'in_progress']);

        const taskCounts: Record<string, number> = {};
        tasks?.forEach(t => {
          if (t.assigned_to) {
            taskCounts[t.assigned_to] = (taskCounts[t.assigned_to] || 0) + 1;
          }
        });

        // Find member with least tasks
        const bestMember = members.reduce((best, current) => {
          const currentCount = taskCounts[current.id] || 0;
          const bestCount = taskCounts[best.id] || 0;
          return currentCount < bestCount ? current : best;
        });

        // Assign the task
        const { error: assignError } = await db
          .from('timeline_tasks')
          .update({ assigned_to: bestMember.id })
          .eq('id', task_id);

        if (assignError) throw assignError;

        return `Assigned task "${task.name}" to ${bestMember.name} (${bestMember.skill}) - they have the most bandwidth with ${taskCounts[bestMember.id] || 0} active tasks.`;
      }

      case 'delete_task': {
        const { task_id } = toolInput as { task_id: string };
        const { data, error } = await db
          .from('timeline_tasks')
          .delete()
          .eq('id', task_id)
          .select()
          .single();

        if (error) throw error;
        return `Deleted task "${data.name}"`;
      }

      case 'delete_company': {
        const { company_id } = toolInput as { company_id: string };

        // Get company name first
        const { data: company } = await db
          .from('companies')
          .select('name')
          .eq('id', company_id)
          .single();

        const { error } = await db
          .from('companies')
          .delete()
          .eq('id', company_id);

        if (error) throw error;
        return `Deleted company "${company?.name}" and all its departments and tasks`;
      }

      default:
        return `Unknown tool: ${toolName}`;
    }
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // System prompt for the AI assistant
    const systemPrompt = `You are TaskTracker AI, an intelligent assistant for managing companies, departments, and tasks.

You can:
- Create companies (departments are auto-created: IT, Manufacturing, Operations, Training, Sales, Marketing, Support, R&D, Investor Relations, HR)
- List and manage tasks across the timeline
- Smart-assign tasks to team members based on their bandwidth and skills
- Move and update tasks

When creating a company, always use create_company which auto-creates all 10 standard departments.
When assigning tasks, use smart_assign_task to automatically pick the best team member.
Be concise and helpful. After performing actions, summarize what you did.

Skills available: product_lead, builder, growth_lead, coordinator
Task statuses: planning, in_progress, completed, blocked
Periods: 0-35 (Jan-Dec, 3 periods per month: 1-10, 11-20, 21-31)`;

    // Call Claude with tools
    const claude = getAnthropicClient();
    let response = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      tools,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Tool use loop - keep calling until no more tools
    const allMessages = [...messages];

    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      const toolResults = await Promise.all(
        toolUseBlocks.map(async (toolUse) => {
          const result = await executeTools(toolUse.name, toolUse.input as Record<string, unknown>);
          return {
            type: 'tool_result' as const,
            tool_use_id: toolUse.id,
            content: result,
          };
        })
      );

      // Add assistant message and tool results
      allMessages.push({ role: 'assistant', content: response.content });
      allMessages.push({ role: 'user', content: toolResults });

      // Call Claude again
      response = await claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        tools,
        messages: allMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });
    }

    // Extract final text response
    const textContent = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );

    return NextResponse.json({
      message: textContent?.text || 'Action completed.',
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
