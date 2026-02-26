import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Admin client bypasses RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - List subtasks for a parent task, or all tasks with subtask info
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parentTaskId = searchParams.get('parentTaskId');
    const managerId = searchParams.get('managerId');

    const admin = getAdminClient();

    // Get user's organization
    const { data: memberships } = await admin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1);

    const membership = memberships?.[0];
    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    if (parentTaskId) {
      // Get subtasks for a specific parent task
      const { data: subtasks, error } = await admin
        .from('timeline_tasks')
        .select(`
          *,
          assignee:profiles!assigned_to(id, name, email)
        `)
        .eq('parent_task_id', parentTaskId)
        .eq('organization_id', membership.organization_id)
        .order('created_at');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get parent task info
      const { data: parentTask } = await admin
        .from('timeline_tasks')
        .select(`
          *,
          manager:profiles!manager_id(id, name, email),
          assignee:profiles!assigned_to(id, name, email)
        `)
        .eq('id', parentTaskId)
        .single();

      return NextResponse.json({
        parentTask,
        subtasks,
        progress: subtasks?.length ?
          Math.round((subtasks.filter(s => s.status === 'completed').length / subtasks.length) * 100) : 0
      });
    } else if (managerId) {
      // Get all tasks where user is manager
      const { data: tasks, error } = await admin
        .from('timeline_tasks')
        .select(`
          *,
          assignee:profiles!assigned_to(id, name, email),
          subtasks:timeline_tasks!parent_task_id(
            id, name, status, assigned_to, due_date, priority,
            assignee:profiles!assigned_to(id, name, email)
          )
        `)
        .eq('manager_id', managerId)
        .eq('organization_id', membership.organization_id)
        .is('is_subtask', false)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ tasks });
    } else {
      // Get all parent tasks with subtask counts
      const { data: tasks, error } = await admin
        .from('timeline_tasks')
        .select(`
          *,
          manager:profiles!manager_id(id, name, email),
          assignee:profiles!assigned_to(id, name, email)
        `)
        .eq('organization_id', membership.organization_id)
        .or('is_subtask.is.null,is_subtask.eq.false')
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get subtask counts for each task
      const tasksWithProgress = await Promise.all((tasks || []).map(async (task) => {
        const { data: subtasks } = await admin
          .from('timeline_tasks')
          .select('id, status')
          .eq('parent_task_id', task.id);

        const subtaskCount = subtasks?.length || 0;
        const completedCount = subtasks?.filter(s => s.status === 'completed').length || 0;
        const progress = subtaskCount > 0 ? Math.round((completedCount / subtaskCount) * 100) : 0;

        return {
          ...task,
          subtaskCount,
          completedSubtaskCount: completedCount,
          subtaskProgress: progress
        };
      }));

      return NextResponse.json({ tasks: tasksWithProgress });
    }
  } catch (e) {
    console.error('GET /api/subtasks error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST - Create a subtask
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { parentTaskId, name, description, assignedTo, dueDate, priority } = body;

    if (!parentTaskId || !name) {
      return NextResponse.json({ error: 'Parent task ID and name are required' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Get user's organization
    const { data: memberships } = await admin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1);

    const membership = memberships?.[0];
    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Verify parent task exists and user is the manager
    const { data: parentTask, error: parentError } = await admin
      .from('timeline_tasks')
      .select('*')
      .eq('id', parentTaskId)
      .eq('organization_id', membership.organization_id)
      .single();

    if (parentError || !parentTask) {
      return NextResponse.json({ error: 'Parent task not found' }, { status: 404 });
    }

    // Check if user is the manager of this task or the task creator
    if (parentTask.manager_id !== user.id && parentTask.assigned_to !== user.id) {
      return NextResponse.json({
        error: 'Only the assigned manager can create subtasks'
      }, { status: 403 });
    }

    // Create subtask
    const { data: subtask, error } = await admin
      .from('timeline_tasks')
      .insert({
        name,
        description,
        parent_task_id: parentTaskId,
        is_subtask: true,
        assigned_to: assignedTo || null,
        due_date: dueDate || null,
        priority: priority || 'medium',
        status: 'planning',
        department_id: parentTask.department_id,
        organization_id: membership.organization_id,
        year: parentTask.year,
        start_period: parentTask.start_period,
        end_period: parentTask.end_period,
        skill: parentTask.skill
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subtask:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ subtask });
  } catch (e) {
    console.error('POST /api/subtasks error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// PUT - Update a subtask or assign manager to task
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, status, assignedTo, dueDate, priority, managerId } = body;

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Get user's organization
    const { data: memberships } = await admin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1);

    const membership = memberships?.[0];
    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (assignedTo !== undefined) updateData.assigned_to = assignedTo;
    if (dueDate !== undefined) updateData.due_date = dueDate;
    if (priority !== undefined) updateData.priority = priority;
    if (managerId !== undefined) updateData.manager_id = managerId;

    const { data: task, error } = await admin
      .from('timeline_tasks')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', membership.organization_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task });
  } catch (e) {
    console.error('PUT /api/subtasks error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// DELETE - Delete a subtask
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Subtask ID is required' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Get user's organization
    const { data: memberships } = await admin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1);

    const membership = memberships?.[0];
    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const { error } = await admin
      .from('timeline_tasks')
      .delete()
      .eq('id', id)
      .eq('organization_id', membership.organization_id)
      .eq('is_subtask', true);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/subtasks error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
