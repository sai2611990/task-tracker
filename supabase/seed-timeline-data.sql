-- Seed file for Timeline data
-- Run this AFTER migrate-timeline.sql
-- This contains the production data from Timeline

-- ============================================
-- CLEAR EXISTING DATA (if needed)
-- ============================================
-- DELETE FROM public.timeline_tasks;
-- DELETE FROM public.departments;
-- DELETE FROM public.companies;

-- ============================================
-- 1. INSERT COMPANIES
-- ============================================
INSERT INTO public.companies (id, name, short_name, industry, color, bg_color) VALUES
  ('11111111-1111-1111-1111-111111111111', 'NovaCube', 'NC', 'Technology', '#3B82F6', '#EFF6FF'),
  ('22222222-2222-2222-2222-222222222222', 'Engineering Square', 'ES', 'Consulting', '#10B981', '#ECFDF5'),
  ('33333333-3333-3333-3333-333333333333', 'InterviewCube', 'IC', 'Technology', '#F59E0B', '#FFFBEB'),
  ('44444444-4444-4444-4444-444444444444', 'GeniusCube', 'GC', 'Technology', '#8B5CF6', '#F5F3FF'),
  ('55555555-5555-5555-5555-555555555555', 'FocusCube', 'FC', 'Technology', '#EF4444', '#FEF2F2'),
  ('66666666-6666-6666-6666-666666666666', 'Nova Office', 'NO', 'Real Estate', '#06B6D4', '#ECFEFF')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  industry = EXCLUDED.industry,
  color = EXCLUDED.color,
  bg_color = EXCLUDED.bg_color;

-- ============================================
-- 2. INSERT DEPARTMENTS FOR NOVACUBE
-- ============================================
INSERT INTO public.departments (id, name, company_id, color) VALUES
  -- NovaCube departments
  ('nc-it-0000-0000-000000000000', 'IT Department', '11111111-1111-1111-1111-111111111111', '#3B82F6'),
  ('nc-mf-0000-0000-000000000000', 'Manufacturing', '11111111-1111-1111-1111-111111111111', '#3B82F6'),
  ('nc-op-0000-0000-000000000000', 'Operations', '11111111-1111-1111-1111-111111111111', '#3B82F6'),
  ('nc-tr-0000-0000-000000000000', 'Training', '11111111-1111-1111-1111-111111111111', '#3B82F6'),
  ('nc-sl-0000-0000-000000000000', 'Sales', '11111111-1111-1111-1111-111111111111', '#3B82F6'),
  ('nc-mk-0000-0000-000000000000', 'Marketing', '11111111-1111-1111-1111-111111111111', '#3B82F6'),
  ('nc-su-0000-0000-000000000000', 'Support', '11111111-1111-1111-1111-111111111111', '#3B82F6'),
  ('nc-rd-0000-0000-000000000000', 'R&D', '11111111-1111-1111-1111-111111111111', '#3B82F6'),
  ('nc-ir-0000-0000-000000000000', 'Investor Relations', '11111111-1111-1111-1111-111111111111', '#3B82F6'),
  ('nc-hr-0000-0000-000000000000', 'Human Resources', '11111111-1111-1111-1111-111111111111', '#3B82F6'),
  -- Engineering Square departments
  ('es-it-0000-0000-000000000000', 'IT Department', '22222222-2222-2222-2222-222222222222', '#10B981'),
  ('es-mf-0000-0000-000000000000', 'Manufacturing', '22222222-2222-2222-2222-222222222222', '#10B981'),
  ('es-op-0000-0000-000000000000', 'Operations', '22222222-2222-2222-2222-222222222222', '#10B981'),
  ('es-tr-0000-0000-000000000000', 'Training', '22222222-2222-2222-2222-222222222222', '#10B981'),
  ('es-sl-0000-0000-000000000000', 'Sales', '22222222-2222-2222-2222-222222222222', '#10B981'),
  ('es-mk-0000-0000-000000000000', 'Marketing', '22222222-2222-2222-2222-222222222222', '#10B981'),
  ('es-su-0000-0000-000000000000', 'Support', '22222222-2222-2222-2222-222222222222', '#10B981'),
  ('es-rd-0000-0000-000000000000', 'R&D', '22222222-2222-2222-2222-222222222222', '#10B981'),
  ('es-ir-0000-0000-000000000000', 'Investor Relations', '22222222-2222-2222-2222-222222222222', '#10B981'),
  ('es-hr-0000-0000-000000000000', 'Human Resources', '22222222-2222-2222-2222-222222222222', '#10B981'),
  -- InterviewCube departments
  ('ic-it-0000-0000-000000000000', 'IT Department', '33333333-3333-3333-3333-333333333333', '#F59E0B'),
  ('ic-mf-0000-0000-000000000000', 'Manufacturing', '33333333-3333-3333-3333-333333333333', '#F59E0B'),
  ('ic-op-0000-0000-000000000000', 'Operations', '33333333-3333-3333-3333-333333333333', '#F59E0B'),
  ('ic-tr-0000-0000-000000000000', 'Training', '33333333-3333-3333-3333-333333333333', '#F59E0B'),
  ('ic-sl-0000-0000-000000000000', 'Sales', '33333333-3333-3333-3333-333333333333', '#F59E0B'),
  ('ic-mk-0000-0000-000000000000', 'Marketing', '33333333-3333-3333-3333-333333333333', '#F59E0B'),
  ('ic-su-0000-0000-000000000000', 'Support', '33333333-3333-3333-3333-333333333333', '#F59E0B'),
  ('ic-rd-0000-0000-000000000000', 'R&D', '33333333-3333-3333-3333-333333333333', '#F59E0B'),
  ('ic-ir-0000-0000-000000000000', 'Investor Relations', '33333333-3333-3333-3333-333333333333', '#F59E0B'),
  ('ic-hr-0000-0000-000000000000', 'Human Resources', '33333333-3333-3333-3333-333333333333', '#F59E0B'),
  -- GeniusCube departments
  ('gc-it-0000-0000-000000000000', 'IT Department', '44444444-4444-4444-4444-444444444444', '#8B5CF6'),
  ('gc-mf-0000-0000-000000000000', 'Manufacturing', '44444444-4444-4444-4444-444444444444', '#8B5CF6'),
  ('gc-op-0000-0000-000000000000', 'Operations', '44444444-4444-4444-4444-444444444444', '#8B5CF6'),
  ('gc-tr-0000-0000-000000000000', 'Training', '44444444-4444-4444-4444-444444444444', '#8B5CF6'),
  ('gc-sl-0000-0000-000000000000', 'Sales', '44444444-4444-4444-4444-444444444444', '#8B5CF6'),
  ('gc-mk-0000-0000-000000000000', 'Marketing', '44444444-4444-4444-4444-444444444444', '#8B5CF6'),
  ('gc-su-0000-0000-000000000000', 'Support', '44444444-4444-4444-4444-444444444444', '#8B5CF6'),
  ('gc-rd-0000-0000-000000000000', 'R&D', '44444444-4444-4444-4444-444444444444', '#8B5CF6'),
  ('gc-ir-0000-0000-000000000000', 'Investor Relations', '44444444-4444-4444-4444-444444444444', '#8B5CF6'),
  ('gc-hr-0000-0000-000000000000', 'Human Resources', '44444444-4444-4444-4444-444444444444', '#8B5CF6'),
  -- FocusCube departments
  ('fc-it-0000-0000-000000000000', 'IT Department', '55555555-5555-5555-5555-555555555555', '#EF4444'),
  ('fc-mf-0000-0000-000000000000', 'Manufacturing', '55555555-5555-5555-5555-555555555555', '#EF4444'),
  ('fc-op-0000-0000-000000000000', 'Operations', '55555555-5555-5555-5555-555555555555', '#EF4444'),
  ('fc-tr-0000-0000-000000000000', 'Training', '55555555-5555-5555-5555-555555555555', '#EF4444'),
  ('fc-sl-0000-0000-000000000000', 'Sales', '55555555-5555-5555-5555-555555555555', '#EF4444'),
  ('fc-mk-0000-0000-000000000000', 'Marketing', '55555555-5555-5555-5555-555555555555', '#EF4444'),
  ('fc-su-0000-0000-000000000000', 'Support', '55555555-5555-5555-5555-555555555555', '#EF4444'),
  ('fc-rd-0000-0000-000000000000', 'R&D', '55555555-5555-5555-5555-555555555555', '#EF4444'),
  ('fc-ir-0000-0000-000000000000', 'Investor Relations', '55555555-5555-5555-5555-555555555555', '#EF4444'),
  ('fc-hr-0000-0000-000000000000', 'Human Resources', '55555555-5555-5555-5555-555555555555', '#EF4444'),
  -- Nova Office departments
  ('no-it-0000-0000-000000000000', 'IT Department', '66666666-6666-6666-6666-666666666666', '#06B6D4'),
  ('no-mf-0000-0000-000000000000', 'Manufacturing', '66666666-6666-6666-6666-666666666666', '#06B6D4'),
  ('no-op-0000-0000-000000000000', 'Operations', '66666666-6666-6666-6666-666666666666', '#06B6D4'),
  ('no-tr-0000-0000-000000000000', 'Training', '66666666-6666-6666-6666-666666666666', '#06B6D4'),
  ('no-sl-0000-0000-000000000000', 'Sales', '66666666-6666-6666-6666-666666666666', '#06B6D4'),
  ('no-mk-0000-0000-000000000000', 'Marketing', '66666666-6666-6666-6666-666666666666', '#06B6D4'),
  ('no-su-0000-0000-000000000000', 'Support', '66666666-6666-6666-6666-666666666666', '#06B6D4'),
  ('no-rd-0000-0000-000000000000', 'R&D', '66666666-6666-6666-6666-666666666666', '#06B6D4'),
  ('no-ir-0000-0000-000000000000', 'Investor Relations', '66666666-6666-6666-6666-666666666666', '#06B6D4'),
  ('no-hr-0000-0000-000000000000', 'Human Resources', '66666666-6666-6666-6666-666666666666', '#06B6D4')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  company_id = EXCLUDED.company_id,
  color = EXCLUDED.color;

-- ============================================
-- 3. INSERT TIMELINE TASKS
-- ============================================

-- NovaCube IT Tasks
INSERT INTO public.timeline_tasks (name, department_id, start_period, end_period, status, skill, year) VALUES
  ('NC Platform - UI Design', 'nc-it-0000-0000-000000000000', 1, 3, 'completed', 'product_lead', 2026),
  ('NC Platform - Development', 'nc-it-0000-0000-000000000000', 2, 5, 'in_progress', 'builder', 2026),
  ('NC Platform - Testing', 'nc-it-0000-0000-000000000000', 4, 6, 'planning', 'builder', 2026),
  ('Admin Portal - UI Design', 'nc-it-0000-0000-000000000000', 6, 8, 'planning', 'product_lead', 2026),
  ('Admin Portal - Development', 'nc-it-0000-0000-000000000000', 7, 10, 'planning', 'builder', 2026),
  ('Training App - Development', 'nc-it-0000-0000-000000000000', 5, 9, 'planning', 'builder', 2026),
  ('Franchising App - Development', 'nc-it-0000-0000-000000000000', 3, 9, 'planning', 'builder', 2026),
  ('IT Genius - AI Features', 'nc-it-0000-0000-000000000000', 3, 11, 'planning', 'builder', 2026),
  ('Website Revamp', 'nc-it-0000-0000-000000000000', 5, 12, 'planning', 'builder', 2026);

-- NovaCube Manufacturing Tasks
INSERT INTO public.timeline_tasks (name, department_id, start_period, end_period, status, skill, year) VALUES
  ('USA Studio Enclosure', 'nc-mf-0000-0000-000000000000', 0, 5, 'in_progress', 'builder', 2026),
  ('India PCB Production', 'nc-mf-0000-0000-000000000000', 1, 7, 'in_progress', 'builder', 2026),
  ('India Studio Assembly', 'nc-mf-0000-0000-000000000000', 3, 15, 'planning', 'builder', 2026),
  ('China Pods Manufacturing', 'nc-mf-0000-0000-000000000000', 0, 7, 'in_progress', 'builder', 2026),
  ('Prototype Hub Tours', 'nc-mf-0000-0000-000000000000', 3, 7, 'planning', 'growth_lead', 2026);

-- NovaCube Operations Tasks
INSERT INTO public.timeline_tasks (name, department_id, start_period, end_period, status, skill, year) VALUES
  ('New Locations - Permits', 'nc-op-0000-0000-000000000000', 2, 6, 'in_progress', 'coordinator', 2026),
  ('New Locations - Leases', 'nc-op-0000-0000-000000000000', 4, 6, 'planning', 'coordinator', 2026),
  ('Install Pods Only', 'nc-op-0000-0000-000000000000', 5, 9, 'planning', 'builder', 2026),
  ('Install With Studio', 'nc-op-0000-0000-000000000000', 8, 15, 'planning', 'builder', 2026),
  ('Hub 1 Installation', 'nc-op-0000-0000-000000000000', 7, 13, 'planning', 'builder', 2026),
  ('Hub 2 Installation', 'nc-op-0000-0000-000000000000', 13, 18, 'planning', 'builder', 2026);

-- NovaCube Training Tasks
INSERT INTO public.timeline_tasks (name, department_id, start_period, end_period, status, skill, year) VALUES
  ('Course Design', 'nc-tr-0000-0000-000000000000', 1, 4, 'in_progress', 'product_lead', 2026),
  ('Find Trainers', 'nc-tr-0000-0000-000000000000', 5, 9, 'planning', 'coordinator', 2026),
  ('Batch 1-3', 'nc-tr-0000-0000-000000000000', 9, 13, 'planning', 'coordinator', 2026),
  ('Batch 4-12', 'nc-tr-0000-0000-000000000000', 12, 18, 'planning', 'coordinator', 2026);

-- NovaCube Sales Tasks
INSERT INTO public.timeline_tasks (name, department_id, start_period, end_period, status, skill, year) VALUES
  ('Location Sales', 'nc-sl-0000-0000-000000000000', 0, 6, 'in_progress', 'growth_lead', 2026),
  ('Franchising Sales', 'nc-sl-0000-0000-000000000000', 4, 15, 'planning', 'growth_lead', 2026),
  ('FC Marketing', 'nc-sl-0000-0000-000000000000', 7, 11, 'planning', 'growth_lead', 2026),
  ('IC Demo', 'nc-sl-0000-0000-000000000000', 10, 13, 'planning', 'growth_lead', 2026),
  ('All Apps Sales', 'nc-sl-0000-0000-000000000000', 12, 18, 'planning', 'growth_lead', 2026);

-- NovaCube Support Tasks
INSERT INTO public.timeline_tasks (name, department_id, start_period, end_period, status, skill, year) VALUES
  ('Permitting Support', 'nc-su-0000-0000-000000000000', 0, 9, 'in_progress', 'coordinator', 2026),
  ('Support Team Setup', 'nc-su-0000-0000-000000000000', 4, 13, 'planning', 'coordinator', 2026);

-- NovaCube Investor Relations Tasks
INSERT INTO public.timeline_tasks (name, department_id, start_period, end_period, status, skill, year) VALUES
  ('Deck Design', 'nc-ir-0000-0000-000000000000', 2, 5, 'in_progress', 'product_lead', 2026),
  ('Practice Sessions', 'nc-ir-0000-0000-000000000000', 4, 7, 'planning', 'growth_lead', 2026),
  ('Investor Pitches', 'nc-ir-0000-0000-000000000000', 6, 15, 'planning', 'growth_lead', 2026);

-- Engineering Square Tasks
INSERT INTO public.timeline_tasks (name, department_id, start_period, end_period, status, skill, year) VALUES
  ('Infrastructure Upgrade', 'es-it-0000-0000-000000000000', 2, 8, 'planning', 'builder', 2026),
  ('Improve E2 Website', 'es-it-0000-0000-000000000000', 3, 10, 'planning', 'builder', 2026),
  ('Q1 Planning', 'es-op-0000-0000-000000000000', 0, 4, 'completed', 'coordinator', 2026),
  ('Q2 Execution', 'es-op-0000-0000-000000000000', 3, 9, 'in_progress', 'builder', 2026),
  ('Market Expansion', 'es-sl-0000-0000-000000000000', 2, 11, 'planning', 'growth_lead', 2026);

-- InterviewCube Tasks
INSERT INTO public.timeline_tasks (name, department_id, start_period, end_period, status, skill, year) VALUES
  ('Platform Upgrade', 'ic-it-0000-0000-000000000000', 1, 7, 'in_progress', 'builder', 2026),
  ('Website Enhancement', 'ic-it-0000-0000-000000000000', 6, 14, 'planning', 'builder', 2026),
  ('Brand Launch', 'ic-mk-0000-0000-000000000000', 6, 11, 'planning', 'growth_lead', 2026),
  ('Social Media Campaign', 'ic-mk-0000-0000-000000000000', 8, 14, 'planning', 'growth_lead', 2026);

-- GeniusCube Tasks
INSERT INTO public.timeline_tasks (name, department_id, start_period, end_period, status, skill, year) VALUES
  ('Website Development', 'gc-it-0000-0000-000000000000', 3, 11, 'planning', 'builder', 2026),
  ('Research Phase', 'gc-rd-0000-0000-000000000000', 0, 6, 'in_progress', 'builder', 2026),
  ('Prototype Development', 'gc-rd-0000-0000-000000000000', 5, 13, 'planning', 'builder', 2026),
  ('AI Model Training', 'gc-rd-0000-0000-000000000000', 10, 20, 'planning', 'builder', 2026);

-- FocusCube Tasks
INSERT INTO public.timeline_tasks (name, department_id, start_period, end_period, status, skill, year) VALUES
  ('Website Redesign', 'fc-it-0000-0000-000000000000', 4, 12, 'planning', 'builder', 2026),
  ('APAC Expansion', 'fc-op-0000-0000-000000000000', 2, 9, 'planning', 'growth_lead', 2026),
  ('EMEA Launch', 'fc-op-0000-0000-000000000000', 8, 16, 'planning', 'growth_lead', 2026),
  ('LATAM Entry', 'fc-op-0000-0000-000000000000', 14, 22, 'planning', 'coordinator', 2026);

-- Nova Office Tasks
INSERT INTO public.timeline_tasks (name, department_id, start_period, end_period, status, skill, year) VALUES
  ('Website Development', 'no-it-0000-0000-000000000000', 2, 10, 'planning', 'builder', 2026);

-- ============================================
-- 4. INSERT TEAM MEMBERS (from data.ts)
-- ============================================
-- Note: These need profiles to exist first, so we'll skip for now
-- The app will work without team members linked to auth

-- ============================================
-- VERIFICATION
-- ============================================
-- SELECT 'Companies' as table_name, count(*) as count FROM public.companies
-- UNION ALL
-- SELECT 'Departments', count(*) FROM public.departments
-- UNION ALL
-- SELECT 'Timeline Tasks', count(*) FROM public.timeline_tasks;
