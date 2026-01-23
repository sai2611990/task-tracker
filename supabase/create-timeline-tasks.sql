-- Create timeline_tasks table with multi-tenancy support
-- Run this in Supabase SQL Editor

-- 1. Add columns to companies if not exist
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS short_name TEXT,
ADD COLUMN IF NOT EXISTS bg_color TEXT DEFAULT '#EFF6FF';

-- 2. Create timeline_tasks table
CREATE TABLE IF NOT EXISTS public.timeline_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    start_period INTEGER NOT NULL CHECK (start_period >= 0 AND start_period <= 35),
    end_period INTEGER NOT NULL CHECK (end_period >= 1 AND end_period <= 36),
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'blocked')),
    skill TEXT DEFAULT 'builder' CHECK (skill IN ('product_lead', 'builder', 'growth_lead', 'coordinator')),
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    year INTEGER DEFAULT 2026,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_period_range CHECK (end_period > start_period)
);

-- 3. Enable RLS
ALTER TABLE public.timeline_tasks ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policy using the function we created earlier
CREATE POLICY "timeline_tasks_select" ON public.timeline_tasks
    FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "timeline_tasks_insert" ON public.timeline_tasks
    FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "timeline_tasks_update" ON public.timeline_tasks
    FOR UPDATE USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "timeline_tasks_delete" ON public.timeline_tasks
    FOR DELETE USING (organization_id IN (SELECT get_user_org_ids()));

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_department ON public.timeline_tasks(department_id);
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_year ON public.timeline_tasks(year);
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_org ON public.timeline_tasks(organization_id);

-- 6. Add trigger for updated_at
DROP TRIGGER IF EXISTS update_timeline_tasks_updated_at ON public.timeline_tasks;
CREATE TRIGGER update_timeline_tasks_updated_at BEFORE UPDATE ON public.timeline_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

SELECT 'timeline_tasks table created successfully' as status;
