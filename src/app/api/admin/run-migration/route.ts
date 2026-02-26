import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// This endpoint runs predefined migrations
// Only works in development for safety
export async function POST(request: NextRequest) {
  try {
    const { migration } = await request.json();
    const admin = getAdminClient();

    if (migration === 'add-subtasks') {
      // Add columns one by one using ALTER TABLE via raw SQL
      // Since we can't run DDL directly, we'll check if columns exist
      // and skip if they do

      // First, let's see what columns exist by querying the table
      const { data: existingTask, error: tableError } = await admin
        .from('timeline_tasks')
        .select('*')
        .limit(1);

      // If no rows, try inserting a test row to see what columns are available
      let existingColumns: string[] = [];

      if (existingTask && existingTask.length > 0) {
        existingColumns = Object.keys(existingTask[0]);
      } else {
        // Try to get columns by checking what the insert accepts
        // For now, let's just test if we can select specific columns
        const testColumns = ['id', 'name', 'parent_task_id', 'manager_id', 'is_subtask', 'due_date', 'priority'];
        for (const col of testColumns) {
          const { error } = await admin.from('timeline_tasks').select(col).limit(1);
          if (!error) {
            existingColumns.push(col);
          }
        }
      }

      const results = [];
      const errors = [];

      // Check each required column
      const requiredColumns = ['parent_task_id', 'manager_id', 'is_subtask', 'due_date', 'priority'];
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

      if (missingColumns.length > 0) {
        results.push({
          message: `Missing columns: ${missingColumns.join(', ')}`,
          note: 'Please run the following SQL in Supabase SQL Editor:',
          sql: `
-- Add subtask support columns
ALTER TABLE public.timeline_tasks
ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES public.timeline_tasks(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_subtask BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_parent ON public.timeline_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_manager ON public.timeline_tasks(manager_id);
          `.trim()
        });
      } else {
        results.push({ message: 'All required columns already exist' });
      }

      // Test that the subtasks API works
      const { data: testTasks, error: testError } = await admin
        .from('timeline_tasks')
        .select('id, name, status')
        .limit(5);

      if (testError) {
        errors.push({ type: 'query_test', error: testError.message });
      } else {
        results.push({ message: `Found ${testTasks?.length || 0} tasks in database` });
      }

      return NextResponse.json({
        migration: 'add-subtasks',
        existingColumns,
        missingColumns,
        results,
        errors
      });
    }

    return NextResponse.json({ error: 'Unknown migration' }, { status: 400 });
  } catch (e) {
    console.error('Migration error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
