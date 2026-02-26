#!/bin/bash
# Run subtask migration via Supabase SQL Editor

# Get the project ref from environment
PROJECT_REF="zlgxekqrlgblgsquvvek"

# SQL to run
SQL=$(cat << 'EOF'
-- Add subtask support columns to timeline_tasks
ALTER TABLE public.timeline_tasks
ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES public.timeline_tasks(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_subtask BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Create indexes for subtasks
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_parent ON public.timeline_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_manager ON public.timeline_tasks(manager_id);

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'timeline_tasks'
ORDER BY ordinal_position;
EOF
)

echo "=== Subtask Migration ==="
echo ""
echo "Please run the following SQL in Supabase SQL Editor:"
echo "URL: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo ""
echo "--- SQL START ---"
echo "$SQL"
echo "--- SQL END ---"
echo ""

# Copy SQL to clipboard if pbcopy is available (macOS)
if command -v pbcopy &> /dev/null; then
    echo "$SQL" | pbcopy
    echo "SQL has been copied to clipboard!"
fi

# Open Supabase dashboard
if command -v open &> /dev/null; then
    echo "Opening Supabase SQL Editor..."
    open "https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
fi
