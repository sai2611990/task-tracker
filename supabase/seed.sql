-- TaskTracker Pro Seed Data
-- Run this after schema.sql

-- ============================================
-- SAMPLE COMPANIES (6 companies for CEO)
-- ============================================
INSERT INTO public.companies (name, industry, color) VALUES
    ('NovaCube', 'Technology', '#3B82F6'),
    ('TechVentures', 'Technology', '#10B981'),
    ('DataFlow Inc', 'Technology', '#F59E0B'),
    ('CloudNine', 'Technology', '#EF4444'),
    ('AI Solutions', 'Technology', '#8B5CF6'),
    ('GreenTech', 'Technology', '#06B6D4');

-- ============================================
-- COMMON DEPARTMENTS FOR EACH COMPANY
-- ============================================

-- NovaCube Departments
INSERT INTO public.departments (name, company_id, color)
SELECT d.name, c.id, d.color
FROM public.companies c
CROSS JOIN (
    VALUES
        ('Accounts', '#10B981'),
        ('Contracts', '#F59E0B'),
        ('Sales', '#3B82F6'),
        ('Support', '#8B5CF6'),
        ('HR', '#EC4899'),
        ('Engineering', '#06B6D4')
) AS d(name, color)
WHERE c.name = 'NovaCube';

-- TechVentures Departments
INSERT INTO public.departments (name, company_id, color)
SELECT d.name, c.id, d.color
FROM public.companies c
CROSS JOIN (
    VALUES
        ('Accounts', '#10B981'),
        ('Contracts', '#F59E0B'),
        ('Sales', '#3B82F6'),
        ('Support', '#8B5CF6'),
        ('HR', '#EC4899'),
        ('Product', '#06B6D4')
) AS d(name, color)
WHERE c.name = 'TechVentures';

-- DataFlow Inc Departments
INSERT INTO public.departments (name, company_id, color)
SELECT d.name, c.id, d.color
FROM public.companies c
CROSS JOIN (
    VALUES
        ('Accounts', '#10B981'),
        ('Contracts', '#F59E0B'),
        ('Sales', '#3B82F6'),
        ('Support', '#8B5CF6'),
        ('HR', '#EC4899'),
        ('Data Science', '#06B6D4')
) AS d(name, color)
WHERE c.name = 'DataFlow Inc';

-- CloudNine Departments
INSERT INTO public.departments (name, company_id, color)
SELECT d.name, c.id, d.color
FROM public.companies c
CROSS JOIN (
    VALUES
        ('Accounts', '#10B981'),
        ('Contracts', '#F59E0B'),
        ('Sales', '#3B82F6'),
        ('Support', '#8B5CF6'),
        ('HR', '#EC4899'),
        ('Cloud Ops', '#06B6D4')
) AS d(name, color)
WHERE c.name = 'CloudNine';

-- AI Solutions Departments
INSERT INTO public.departments (name, company_id, color)
SELECT d.name, c.id, d.color
FROM public.companies c
CROSS JOIN (
    VALUES
        ('Accounts', '#10B981'),
        ('Contracts', '#F59E0B'),
        ('Sales', '#3B82F6'),
        ('Support', '#8B5CF6'),
        ('HR', '#EC4899'),
        ('ML Research', '#06B6D4')
) AS d(name, color)
WHERE c.name = 'AI Solutions';

-- GreenTech Departments
INSERT INTO public.departments (name, company_id, color)
SELECT d.name, c.id, d.color
FROM public.companies c
CROSS JOIN (
    VALUES
        ('Accounts', '#10B981'),
        ('Contracts', '#F59E0B'),
        ('Sales', '#3B82F6'),
        ('Support', '#8B5CF6'),
        ('HR', '#EC4899'),
        ('Sustainability', '#06B6D4')
) AS d(name, color)
WHERE c.name = 'GreenTech';

-- ============================================
-- SAMPLE PROJECTS FOR NOVACUBE
-- ============================================
INSERT INTO public.projects (name, description, company_id, department_id, status, start_date, end_date)
SELECT
    'Q1 Launch Plan',
    'Product launch initiative for Q1 2026',
    c.id,
    d.id,
    'active',
    '2026-01-01',
    '2026-03-31'
FROM public.companies c
JOIN public.departments d ON d.company_id = c.id
WHERE c.name = 'NovaCube' AND d.name = 'Sales';

INSERT INTO public.projects (name, description, company_id, department_id, status, start_date, end_date)
SELECT
    'Hiring Sprint Q1',
    'Expand engineering team by 5 members',
    c.id,
    d.id,
    'active',
    '2026-01-15',
    '2026-02-28'
FROM public.companies c
JOIN public.departments d ON d.company_id = c.id
WHERE c.name = 'NovaCube' AND d.name = 'HR';

-- ============================================
-- SAMPLE TASKS
-- ============================================
INSERT INTO public.tasks (title, description, project_id, status, priority, due_date, is_checkpoint)
SELECT
    'Finalize launch timeline',
    'Review and approve the final launch schedule',
    p.id,
    'in_progress',
    'high',
    '2026-01-22',
    FALSE
FROM public.projects p WHERE p.name = 'Q1 Launch Plan';

INSERT INTO public.tasks (title, description, project_id, status, priority, due_date, is_checkpoint)
SELECT
    'Marketing materials approval',
    'Get sign-off on all marketing collateral',
    p.id,
    'todo',
    'high',
    '2026-01-25',
    TRUE
FROM public.projects p WHERE p.name = 'Q1 Launch Plan';

INSERT INTO public.tasks (title, description, project_id, status, priority, due_date, is_checkpoint)
SELECT
    'Budget review meeting',
    'Final budget allocation review with finance',
    p.id,
    'todo',
    'urgent',
    '2026-01-20',
    TRUE
FROM public.projects p WHERE p.name = 'Q1 Launch Plan';

INSERT INTO public.tasks (title, description, project_id, status, priority, due_date, is_checkpoint)
SELECT
    'Post job descriptions',
    'Publish all 5 engineering positions',
    p.id,
    'completed',
    'medium',
    '2026-01-18',
    FALSE
FROM public.projects p WHERE p.name = 'Hiring Sprint Q1';

INSERT INTO public.tasks (title, description, project_id, status, priority, due_date, is_checkpoint)
SELECT
    'Screen candidates',
    'Initial screening of applications',
    p.id,
    'in_progress',
    'high',
    '2026-01-30',
    FALSE
FROM public.projects p WHERE p.name = 'Hiring Sprint Q1';

-- ============================================
-- SAMPLE DEPARTMENT TARGETS
-- ============================================
INSERT INTO public.department_targets (department_id, objective, description, timeline, status)
SELECT
    d.id,
    'Increase Q1 sales by 25%',
    'Target revenue increase through new product launch',
    'Q1 2026',
    'frozen'
FROM public.departments d
JOIN public.companies c ON d.company_id = c.id
WHERE c.name = 'NovaCube' AND d.name = 'Sales';

INSERT INTO public.department_targets (department_id, objective, description, timeline, status)
SELECT
    d.id,
    'Hire 5 senior engineers',
    'Expand team capacity for upcoming projects',
    'Q1 2026',
    'frozen'
FROM public.departments d
JOIN public.companies c ON d.company_id = c.id
WHERE c.name = 'NovaCube' AND d.name = 'HR';

INSERT INTO public.department_targets (department_id, objective, description, timeline, status)
SELECT
    d.id,
    'Reduce support ticket resolution time by 20%',
    'Improve customer satisfaction through faster response',
    'Q1 2026',
    'in_progress'
FROM public.departments d
JOIN public.companies c ON d.company_id = c.id
WHERE c.name = 'NovaCube' AND d.name = 'Support';
