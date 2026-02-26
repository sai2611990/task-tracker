-- Add subtask support to timeline_tasks
-- This allows managers to break down tasks into subtasks

-- 1. Add subtask-related columns to timeline_tasks
ALTER TABLE public.timeline_tasks
ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES public.timeline_tasks(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_subtask BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- 2. Create index for parent-child relationship
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_parent ON public.timeline_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_manager ON public.timeline_tasks(manager_id);

-- 3. Create function to calculate subtask progress for a parent task
CREATE OR REPLACE FUNCTION calculate_task_progress(task_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_subtasks INTEGER;
  completed_subtasks INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_subtasks, completed_subtasks
  FROM timeline_tasks
  WHERE parent_task_id = task_id;

  IF total_subtasks = 0 THEN
    RETURN 0;
  END IF;

  RETURN ROUND((completed_subtasks::NUMERIC / total_subtasks::NUMERIC) * 100);
END;
$$ LANGUAGE plpgsql;

-- 4. Create view for tasks with progress
CREATE OR REPLACE VIEW timeline_tasks_with_progress AS
SELECT
  t.*,
  calculate_task_progress(t.id) as subtask_progress,
  (SELECT COUNT(*) FROM timeline_tasks WHERE parent_task_id = t.id) as subtask_count,
  (SELECT COUNT(*) FROM timeline_tasks WHERE parent_task_id = t.id AND status = 'completed') as completed_subtask_count,
  p.name as manager_name,
  p.email as manager_email,
  a.name as assignee_name,
  a.email as assignee_email
FROM timeline_tasks t
LEFT JOIN profiles p ON t.manager_id = p.id
LEFT JOIN profiles a ON t.assigned_to = a.id
WHERE t.is_subtask = FALSE OR t.is_subtask IS NULL;

-- 5. Create view for subtasks
CREATE OR REPLACE VIEW subtasks_view AS
SELECT
  t.*,
  p.name as assignee_name,
  p.email as assignee_email,
  pt.name as parent_task_name,
  pt.due_date as parent_due_date
FROM timeline_tasks t
LEFT JOIN profiles p ON t.assigned_to = p.id
LEFT JOIN timeline_tasks pt ON t.parent_task_id = pt.id
WHERE t.is_subtask = TRUE;

SELECT 'Subtask support added successfully' as status;
