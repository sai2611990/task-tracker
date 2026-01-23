-- Migration to support Timeline data
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. ADD COLUMNS TO COMPANIES TABLE
-- ============================================
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS short_name TEXT,
ADD COLUMN IF NOT EXISTS bg_color TEXT DEFAULT '#EFF6FF';

-- ============================================
-- 2. ADD SKILL TYPE
-- ============================================
DO $$ BEGIN
    CREATE TYPE skill_type AS ENUM ('product_lead', 'builder', 'growth_lead', 'coordinator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 3. CREATE TIMELINE_TASKS TABLE
-- Period-based tasks for Timeline view (0-35 = Jan-Dec, 3 periods each)
-- ============================================
CREATE TABLE IF NOT EXISTS public.timeline_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
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

-- ============================================
-- 4. ADD COLUMNS TO PROFILES FOR TEAM MEMBERS
-- ============================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS skill TEXT DEFAULT 'builder' CHECK (skill IN ('product_lead', 'builder', 'growth_lead', 'coordinator')),
ADD COLUMN IF NOT EXISTS team_role TEXT DEFAULT 'member' CHECK (team_role IN ('lead', 'member'));

-- ============================================
-- 5. ADD PROGRESS TO DEPARTMENT_TARGETS
-- ============================================
ALTER TABLE public.department_targets
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
ADD COLUMN IF NOT EXISTS key_results TEXT[];

-- ============================================
-- 6. ENABLE RLS ON NEW TABLE
-- ============================================
ALTER TABLE public.timeline_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Timeline tasks are viewable by authenticated users" ON public.timeline_tasks
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Timeline tasks are editable by authenticated users" ON public.timeline_tasks
    FOR ALL TO authenticated USING (true);

-- ============================================
-- 7. CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_department ON public.timeline_tasks(department_id);
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_year ON public.timeline_tasks(year);
CREATE INDEX IF NOT EXISTS idx_timeline_tasks_status ON public.timeline_tasks(status);

-- ============================================
-- 8. ADD TRIGGER FOR UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS update_timeline_tasks_updated_at ON public.timeline_tasks;
CREATE TRIGGER update_timeline_tasks_updated_at BEFORE UPDATE ON public.timeline_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 9. ALLOW PUBLIC ACCESS FOR DEVELOPMENT
-- (Remove in production or add proper auth)
-- ============================================
CREATE POLICY IF NOT EXISTS "Allow public read on companies" ON public.companies
    FOR SELECT TO anon USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read on departments" ON public.departments
    FOR SELECT TO anon USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read on timeline_tasks" ON public.timeline_tasks
    FOR SELECT TO anon USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read on profiles" ON public.profiles
    FOR SELECT TO anon USING (true);

CREATE POLICY IF NOT EXISTS "Allow public read on department_targets" ON public.department_targets
    FOR SELECT TO anon USING (true);
