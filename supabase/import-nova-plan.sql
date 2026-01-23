-- NOVA PLAN Import Script
-- Run this in Supabase SQL Editor

-- 1. Create NovaCube company
INSERT INTO companies (id, name, industry, color) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'NovaCube', 'Technology', '#3B82F6')
ON CONFLICT (id) DO NOTHING;

-- 2. Create departments
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000001', 'USA STUDIO ENCLOSURE', '11111111-1111-1111-1111-111111111111', '#6B7280')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000002', 'INDIA PCB', '11111111-1111-1111-1111-111111111111', '#6B7280')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000003', 'INDIA STUDIO ENCLOSURE', '11111111-1111-1111-1111-111111111111', '#6B7280')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000004', 'INDIA POD MANUFACTURERES', '11111111-1111-1111-1111-111111111111', '#6B7280')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000005', 'NEW LOCATIONS', '11111111-1111-1111-1111-111111111111', '#6B7280')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000006', 'EXISTING', '11111111-1111-1111-1111-111111111111', '#6B7280')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000007', 'DECK/FUNDRAISING', '11111111-1111-1111-1111-111111111111', '#6B7280')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000008', 'PROTYPE HUB', '11111111-1111-1111-1111-111111111111', '#6B7280')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000009', 'CHINA PODS 1 PERSON', '11111111-1111-1111-1111-111111111111', '#6B7280')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000010', 'CHINA PODS ARRIVAL', '11111111-1111-1111-1111-111111111111', '#6B7280')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000011', 'INSTALLATION', '11111111-1111-1111-1111-111111111111', '#6B7280')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000012', 'IT NC', '11111111-1111-1111-1111-111111111111', '#3B82F6')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000013', 'IT ADMIN NC', '11111111-1111-1111-1111-111111111111', '#3B82F6')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000014', 'IT FC', '11111111-1111-1111-1111-111111111111', '#3B82F6')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000015', 'IT IC', '11111111-1111-1111-1111-111111111111', '#3B82F6')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000016', 'IT WC', '11111111-1111-1111-1111-111111111111', '#3B82F6')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000017', 'IT -TRAINING APP', '11111111-1111-1111-1111-111111111111', '#3B82F6')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000018', 'IT FRANCISING APP', '11111111-1111-1111-1111-111111111111', '#3B82F6')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000019', 'IT GENIUS', '11111111-1111-1111-1111-111111111111', '#3B82F6')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000020', 'TRAINING OPS', '11111111-1111-1111-1111-111111111111', '#10B981')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000021', 'NOVA SALES OPS', '11111111-1111-1111-1111-111111111111', '#F59E0B')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000022', 'NOVA SUPPORT OPS', '11111111-1111-1111-1111-111111111111', '#6B7280')
ON CONFLICT (id) DO NOTHING;
INSERT INTO departments (id, name, company_id, color) VALUES 
  ('22222222-2222-2222-2222-000000000023', 'OTHER SALES OPS', '11111111-1111-1111-1111-111111111111', '#F59E0B')
ON CONFLICT (id) DO NOTHING;

-- 3. Create projects
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000001', 'USA STUDIO ENCLOSURE - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000001', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000002', 'INDIA PCB - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000002', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000003', 'INDIA STUDIO ENCLOSURE - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000003', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000004', 'INDIA POD MANUFACTURERES - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000004', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000005', 'NEW LOCATIONS - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000005', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000006', 'EXISTING - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000006', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000007', 'DECK/FUNDRAISING - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000007', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000008', 'PROTYPE HUB - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000008', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000009', 'CHINA PODS 1 PERSON - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000009', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000010', 'CHINA PODS ARRIVAL - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000010', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000011', 'INSTALLATION - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000011', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000012', 'IT NC - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000012', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000013', 'IT ADMIN NC - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000013', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000014', 'IT FC - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000014', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000015', 'IT IC - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000015', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000016', 'IT WC - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000016', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000017', 'IT -TRAINING APP - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000017', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000018', 'IT FRANCISING APP - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000018', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000019', 'IT GENIUS - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000019', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000020', 'TRAINING OPS - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000020', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000021', 'NOVA SALES OPS - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000021', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000022', 'NOVA SUPPORT OPS - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000022', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, name, company_id, department_id, status, start_date, end_date) VALUES 
  ('33333333-3333-3333-3333-000000000023', 'OTHER SALES OPS - Q1 2026', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000023', 'active', '2026-01-01', '2026-06-30')
ON CONFLICT (id) DO NOTHING;

-- 4. Create tasks
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DESIGN', '33333333-3333-3333-3333-000000000001', 'todo', 'medium', '2026-01-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DESIGN', '33333333-3333-3333-3333-000000000002', 'todo', 'medium', '2026-01-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('WARE HOUSE SETUP', '33333333-3333-3333-3333-000000000003', 'todo', 'medium', '2026-01-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MEETINGS', '33333333-3333-3333-3333-000000000005', 'todo', 'medium', '2026-01-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DESIGN', '33333333-3333-3333-3333-000000000008', 'todo', 'medium', '2026-01-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING', '33333333-3333-3333-3333-000000000009', 'todo', 'medium', '2026-01-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING', '33333333-3333-3333-3333-000000000010', 'todo', 'medium', '2026-01-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('BIZ REQ FINAL', '33333333-3333-3333-3333-000000000018', 'todo', 'medium', '2026-01-10', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PROGRAM DESIGN', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-01-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('LOCATIONS', '33333333-3333-3333-3333-000000000021', 'todo', 'medium', '2026-01-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PERMITTING', '33333333-3333-3333-3333-000000000022', 'todo', 'medium', '2026-01-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PROTOTYPING', '33333333-3333-3333-3333-000000000001', 'todo', 'medium', '2026-01-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PCB REQ AND DESIGN', '33333333-3333-3333-3333-000000000002', 'todo', 'medium', '2026-01-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('WARE HOUSE SETUP & HIRING', '33333333-3333-3333-3333-000000000003', 'todo', 'medium', '2026-01-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DISCUSS & QUOTE', '33333333-3333-3333-3333-000000000004', 'todo', 'medium', '2026-01-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MEETINGS', '33333333-3333-3333-3333-000000000005', 'todo', 'medium', '2026-01-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('START', '33333333-3333-3333-3333-000000000007', 'todo', 'medium', '2026-01-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PICTURES', '33333333-3333-3333-3333-000000000008', 'todo', 'medium', '2026-01-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING', '33333333-3333-3333-3333-000000000009', 'todo', 'medium', '2026-01-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING', '33333333-3333-3333-3333-000000000010', 'todo', 'medium', '2026-01-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('UI', '33333333-3333-3333-3333-000000000012', 'todo', 'medium', '2026-01-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('IDEA', '33333333-3333-3333-3333-000000000017', 'todo', 'medium', '2026-01-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('UX UI', '33333333-3333-3333-3333-000000000018', 'todo', 'medium', '2026-01-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('COURSE DESIGN', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-01-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('LOCATIONS', '33333333-3333-3333-3333-000000000021', 'todo', 'medium', '2026-01-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PERMITTING', '33333333-3333-3333-3333-000000000022', 'todo', 'medium', '2026-01-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FINAL', '33333333-3333-3333-3333-000000000001', 'todo', 'medium', '2026-01-30', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000002', 'todo', 'medium', '2026-01-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('WARE HOUSE SETUP & HIRING', '33333333-3333-3333-3333-000000000003', 'todo', 'medium', '2026-01-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('ORDER SAMPLE', '33333333-3333-3333-3333-000000000004', 'todo', 'medium', '2026-01-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PERMIT', '33333333-3333-3333-3333-000000000005', 'todo', 'medium', '2026-01-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DECK DESIGN', '33333333-3333-3333-3333-000000000007', 'todo', 'medium', '2026-01-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PICTURES', '33333333-3333-3333-3333-000000000008', 'todo', 'medium', '2026-01-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING', '33333333-3333-3333-3333-000000000009', 'todo', 'medium', '2026-01-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING', '33333333-3333-3333-3333-000000000010', 'todo', 'medium', '2026-01-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000012', 'todo', 'medium', '2026-01-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('BIZ RES FINAL', '33333333-3333-3333-3333-000000000017', 'todo', 'medium', '2026-01-30', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('UX UI', '33333333-3333-3333-3333-000000000018', 'todo', 'medium', '2026-01-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000019', 'todo', 'medium', '2026-01-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FIND TRAINERS', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-01-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('LOCATIONS', '33333333-3333-3333-3333-000000000021', 'todo', 'medium', '2026-01-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PERMITTING', '33333333-3333-3333-3333-000000000022', 'todo', 'medium', '2026-01-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FINAL', '33333333-3333-3333-3333-000000000001', 'todo', 'medium', '2026-02-10', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000002', 'todo', 'medium', '2026-02-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PROTOTYPING AND WARE HOUSE SETUP', '33333333-3333-3333-3333-000000000003', 'todo', 'medium', '2026-02-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('SAMPLE MANUFACTURE', '33333333-3333-3333-3333-000000000004', 'todo', 'medium', '2026-02-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PERMIT', '33333333-3333-3333-3333-000000000005', 'todo', 'medium', '2026-02-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DECK DESIGN', '33333333-3333-3333-3333-000000000007', 'todo', 'medium', '2026-02-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TOURS', '33333333-3333-3333-3333-000000000008', 'todo', 'medium', '2026-02-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('ON SEA', '33333333-3333-3333-3333-000000000009', 'todo', 'medium', '2026-02-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('ON SEA', '33333333-3333-3333-3333-000000000010', 'todo', 'medium', '2026-02-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TEST', '33333333-3333-3333-3333-000000000012', 'todo', 'medium', '2026-02-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('UX UI', '33333333-3333-3333-3333-000000000017', 'todo', 'medium', '2026-02-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000018', 'todo', 'medium', '2026-02-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000019', 'todo', 'medium', '2026-02-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FIND TRAINERS', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-02-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('LOCATIONS', '33333333-3333-3333-3333-000000000021', 'todo', 'medium', '2026-02-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PERMITTING', '33333333-3333-3333-3333-000000000022', 'todo', 'medium', '2026-02-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING 2 -NO PCB', '33333333-3333-3333-3333-000000000001', 'todo', 'medium', '2026-02-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PROTOTYPING', '33333333-3333-3333-3333-000000000002', 'todo', 'medium', '2026-02-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('ASSEMBLE STUDIO TEST', '33333333-3333-3333-3333-000000000003', 'todo', 'medium', '2026-02-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('SAMPLE MANUFACTURE', '33333333-3333-3333-3333-000000000004', 'todo', 'medium', '2026-02-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('LEASES', '33333333-3333-3333-3333-000000000005', 'todo', 'medium', '2026-02-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PRACTICE', '33333333-3333-3333-3333-000000000007', 'todo', 'medium', '2026-02-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TOURS', '33333333-3333-3333-3333-000000000008', 'todo', 'medium', '2026-02-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('ON SEA', '33333333-3333-3333-3333-000000000009', 'todo', 'medium', '2026-02-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('ON SEA', '33333333-3333-3333-3333-000000000010', 'todo', 'medium', '2026-02-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PROD', '33333333-3333-3333-3333-000000000012', 'todo', 'medium', '2026-02-20', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('UI', '33333333-3333-3333-3333-000000000014', 'todo', 'medium', '2026-02-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('UX UI', '33333333-3333-3333-3333-000000000017', 'todo', 'medium', '2026-02-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000018', 'todo', 'medium', '2026-02-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('COURSE FINAL', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-02-20', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FRANCHISING', '33333333-3333-3333-3333-000000000021', 'todo', 'medium', '2026-02-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('SUPPORT AND PERMITTING', '33333333-3333-3333-3333-000000000022', 'todo', 'medium', '2026-02-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING 2 -NO PCB', '33333333-3333-3333-3333-000000000001', 'todo', 'medium', '2026-02-28', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TEST', '33333333-3333-3333-3333-000000000002', 'todo', 'medium', '2026-02-28', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TRAINING', '33333333-3333-3333-3333-000000000003', 'todo', 'medium', '2026-02-28', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TEST', '33333333-3333-3333-3333-000000000004', 'todo', 'medium', '2026-02-28', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('INSTALL ONLY PODS', '33333333-3333-3333-3333-000000000005', 'todo', 'medium', '2026-02-28', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PRACTICE', '33333333-3333-3333-3333-000000000007', 'todo', 'medium', '2026-02-28', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TOURS', '33333333-3333-3333-3333-000000000008', 'todo', 'medium', '2026-02-28', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('ON SEA', '33333333-3333-3333-3333-000000000009', 'todo', 'medium', '2026-02-28', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('ON SEA', '33333333-3333-3333-3333-000000000010', 'todo', 'medium', '2026-02-28', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000014', 'todo', 'medium', '2026-02-28', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000017', 'todo', 'medium', '2026-02-28', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000018', 'todo', 'medium', '2026-02-28', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('COURSE FINAL', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-02-28', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FRANCHISING', '33333333-3333-3333-3333-000000000021', 'todo', 'medium', '2026-02-28', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('SUPPORT AND PERMITTING', '33333333-3333-3333-3333-000000000022', 'todo', 'medium', '2026-02-28', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING 3 -NO PCB', '33333333-3333-3333-3333-000000000001', 'todo', 'medium', '2026-03-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('CERT & 100 PC ORDER', '33333333-3333-3333-3333-000000000002', 'todo', 'medium', '2026-03-10', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TRAINING', '33333333-3333-3333-3333-000000000003', 'todo', 'medium', '2026-03-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PLACE ORDER', '33333333-3333-3333-3333-000000000004', 'todo', 'medium', '2026-03-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('INSTALL ONLY PODS', '33333333-3333-3333-3333-000000000005', 'todo', 'medium', '2026-03-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PITCH', '33333333-3333-3333-3333-000000000007', 'todo', 'medium', '2026-03-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TOURS', '33333333-3333-3333-3333-000000000008', 'todo', 'medium', '2026-03-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('ON LOCAL STORAGE', '33333333-3333-3333-3333-000000000009', 'todo', 'medium', '2026-03-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('ON LOCAL STORAGE', '33333333-3333-3333-3333-000000000010', 'todo', 'medium', '2026-03-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('UI', '33333333-3333-3333-3333-000000000013', 'todo', 'medium', '2026-03-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TEST', '33333333-3333-3333-3333-000000000014', 'todo', 'medium', '2026-03-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('UI', '33333333-3333-3333-3333-000000000016', 'todo', 'medium', '2026-03-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000017', 'todo', 'medium', '2026-03-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TEST', '33333333-3333-3333-3333-000000000018', 'todo', 'medium', '2026-03-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000019', 'todo', 'medium', '2026-03-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FIND TRAINEES', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-03-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FRANCHISING', '33333333-3333-3333-3333-000000000021', 'todo', 'medium', '2026-03-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('SUPPORT AND PERMITTING', '33333333-3333-3333-3333-000000000022', 'todo', 'medium', '2026-03-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING 3 -NO PCB', '33333333-3333-3333-3333-000000000001', 'todo', 'medium', '2026-03-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('CERT', '33333333-3333-3333-3333-000000000002', 'todo', 'medium', '2026-03-20', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING 10 & TEST 10', '33333333-3333-3333-3333-000000000003', 'todo', 'medium', '2026-03-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('INSTALL ONLY PODS', '33333333-3333-3333-3333-000000000005', 'todo', 'medium', '2026-03-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEPLOY WITH STUDIO', '33333333-3333-3333-3333-000000000006', 'todo', 'medium', '2026-03-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PITCH', '33333333-3333-3333-3333-000000000007', 'todo', 'medium', '2026-03-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('SAMPLE TEST', '33333333-3333-3333-3333-000000000009', 'todo', 'medium', '2026-03-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TEST', '33333333-3333-3333-3333-000000000010', 'todo', 'medium', '2026-03-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('1 HUB', '33333333-3333-3333-3333-000000000011', 'todo', 'medium', '2026-03-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000013', 'todo', 'medium', '2026-03-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PROD', '33333333-3333-3333-3333-000000000014', 'todo', 'medium', '2026-03-20', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000016', 'todo', 'medium', '2026-03-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000017', 'todo', 'medium', '2026-03-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PROD', '33333333-3333-3333-3333-000000000018', 'todo', 'medium', '2026-03-20', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000019', 'todo', 'medium', '2026-03-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FIND TRAINEES', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-03-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FRANCHISING', '33333333-3333-3333-3333-000000000021', 'todo', 'medium', '2026-03-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('SUPPORT AND PERMITTING', '33333333-3333-3333-3333-000000000022', 'todo', 'medium', '2026-03-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FC MARKETING _PREP', '33333333-3333-3333-3333-000000000023', 'todo', 'medium', '2026-03-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING 3 WITH PCB', '33333333-3333-3333-3333-000000000001', 'todo', 'medium', '2026-03-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('CERT', '33333333-3333-3333-3333-000000000002', 'todo', 'medium', '2026-03-30', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING 10 & SHIP 10', '33333333-3333-3333-3333-000000000003', 'todo', 'medium', '2026-03-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('INSTALL ONLY PODS', '33333333-3333-3333-3333-000000000005', 'todo', 'medium', '2026-03-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEPLOY WITH STUDIO', '33333333-3333-3333-3333-000000000006', 'todo', 'medium', '2026-03-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PITCH', '33333333-3333-3333-3333-000000000007', 'todo', 'medium', '2026-03-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PLACE NEW ORDER', '33333333-3333-3333-3333-000000000009', 'todo', 'medium', '2026-03-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PLACE NEW ORDER', '33333333-3333-3333-3333-000000000010', 'todo', 'medium', '2026-03-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('1 HUB', '33333333-3333-3333-3333-000000000011', 'todo', 'medium', '2026-03-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TEST', '33333333-3333-3333-3333-000000000013', 'todo', 'medium', '2026-03-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TEST', '33333333-3333-3333-3333-000000000016', 'todo', 'medium', '2026-03-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TEST', '33333333-3333-3333-3333-000000000017', 'todo', 'medium', '2026-03-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000019', 'todo', 'medium', '2026-03-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FIND TRAINEES', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-03-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FRANCHISING', '33333333-3333-3333-3333-000000000021', 'todo', 'medium', '2026-03-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('SUPPORT AND PERMITTING', '33333333-3333-3333-3333-000000000022', 'todo', 'medium', '2026-03-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FC MARKETING _PREP', '33333333-3333-3333-3333-000000000023', 'todo', 'medium', '2026-03-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('CERT', '33333333-3333-3333-3333-000000000002', 'todo', 'medium', '2026-04-10', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING 10 & SHIP 10', '33333333-3333-3333-3333-000000000003', 'todo', 'medium', '2026-04-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('INSTALL WITH STUDIO', '33333333-3333-3333-3333-000000000005', 'todo', 'medium', '2026-04-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEPLOY WITH STUDIO', '33333333-3333-3333-3333-000000000006', 'todo', 'medium', '2026-04-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PITCH', '33333333-3333-3333-3333-000000000007', 'todo', 'medium', '2026-04-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PLACE NEW ORDER', '33333333-3333-3333-3333-000000000009', 'todo', 'medium', '2026-04-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PLACE NEW ORDER', '33333333-3333-3333-3333-000000000010', 'todo', 'medium', '2026-04-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('1 HUB', '33333333-3333-3333-3333-000000000011', 'todo', 'medium', '2026-04-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PROD', '33333333-3333-3333-3333-000000000013', 'todo', 'medium', '2026-04-10', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PROD', '33333333-3333-3333-3333-000000000016', 'todo', 'medium', '2026-04-10', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PROD', '33333333-3333-3333-3333-000000000017', 'todo', 'medium', '2026-04-10', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TEST', '33333333-3333-3333-3333-000000000019', 'todo', 'medium', '2026-04-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('START TRAINING BATCH 1', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-04-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FRANCHISING', '33333333-3333-3333-3333-000000000021', 'todo', 'medium', '2026-04-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('SUPPORT AND PERMITTING', '33333333-3333-3333-3333-000000000022', 'todo', 'medium', '2026-04-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FC MARKETING', '33333333-3333-3333-3333-000000000023', 'todo', 'medium', '2026-04-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FINAL CERT', '33333333-3333-3333-3333-000000000002', 'todo', 'medium', '2026-04-20', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING 10 & SHIP 10', '33333333-3333-3333-3333-000000000003', 'todo', 'medium', '2026-04-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('INSTALL WITH STUDIO', '33333333-3333-3333-3333-000000000005', 'todo', 'medium', '2026-04-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PITCH', '33333333-3333-3333-3333-000000000007', 'todo', 'medium', '2026-04-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('1 HUB', '33333333-3333-3333-3333-000000000011', 'todo', 'medium', '2026-04-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('UI', '33333333-3333-3333-3333-000000000015', 'todo', 'medium', '2026-04-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TEST', '33333333-3333-3333-3333-000000000019', 'todo', 'medium', '2026-04-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('START TRAINING BATCH 2', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-04-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FRANCHISING', '33333333-3333-3333-3333-000000000021', 'todo', 'medium', '2026-04-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('SUPPORT AND PERMITTING', '33333333-3333-3333-3333-000000000022', 'todo', 'medium', '2026-04-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('IC DEMO PREP', '33333333-3333-3333-3333-000000000023', 'todo', 'medium', '2026-04-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING 10 & SHIP 10', '33333333-3333-3333-3333-000000000003', 'todo', 'medium', '2026-04-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('INSTALL WITH STUDIO', '33333333-3333-3333-3333-000000000005', 'todo', 'medium', '2026-04-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PITCH', '33333333-3333-3333-3333-000000000007', 'todo', 'medium', '2026-04-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('1 HUB', '33333333-3333-3333-3333-000000000011', 'todo', 'medium', '2026-04-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('DEV', '33333333-3333-3333-3333-000000000015', 'todo', 'medium', '2026-04-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PROD', '33333333-3333-3333-3333-000000000019', 'todo', 'medium', '2026-04-30', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('START TRAINING BATCH 3', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-04-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FRANCHISING', '33333333-3333-3333-3333-000000000021', 'todo', 'medium', '2026-04-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('SUPPORT AND PERMITTING', '33333333-3333-3333-3333-000000000022', 'todo', 'medium', '2026-04-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('IC DEMO', '33333333-3333-3333-3333-000000000023', 'todo', 'medium', '2026-04-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING 10 & SHIP 10', '33333333-3333-3333-3333-000000000003', 'todo', 'medium', '2026-05-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('INSTALL WITH STUDIO', '33333333-3333-3333-3333-000000000005', 'todo', 'medium', '2026-05-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PITCH', '33333333-3333-3333-3333-000000000007', 'todo', 'medium', '2026-05-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('1 HUB', '33333333-3333-3333-3333-000000000011', 'todo', 'medium', '2026-05-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('TEST', '33333333-3333-3333-3333-000000000015', 'todo', 'medium', '2026-05-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('START TRAINING BATCH 2', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-05-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('FRANCHISING', '33333333-3333-3333-3333-000000000021', 'todo', 'medium', '2026-05-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('ALL SALES', '33333333-3333-3333-3333-000000000023', 'todo', 'medium', '2026-05-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING 10 & SHIP 10', '33333333-3333-3333-3333-000000000003', 'todo', 'medium', '2026-05-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('INSTALL WITH STUDIO', '33333333-3333-3333-3333-000000000005', 'todo', 'medium', '2026-05-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PITCH', '33333333-3333-3333-3333-000000000007', 'todo', 'medium', '2026-05-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('2 HUB', '33333333-3333-3333-3333-000000000011', 'todo', 'medium', '2026-05-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('PROD', '33333333-3333-3333-3333-000000000015', 'todo', 'medium', '2026-05-20', true);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('START TRAINING BATCH 1', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-05-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('ALL SALES', '33333333-3333-3333-3333-000000000023', 'todo', 'medium', '2026-05-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('MANUFACTURING 10 & SHIP 10', '33333333-3333-3333-3333-000000000003', 'todo', 'medium', '2026-05-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('2 HUB', '33333333-3333-3333-3333-000000000011', 'todo', 'medium', '2026-05-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('START TRAINING BATCH 2', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-05-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('GC DEMO', '33333333-3333-3333-3333-000000000023', 'todo', 'medium', '2026-05-30', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('START TRAINING BATCH 1', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-06-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('ALL SALES', '33333333-3333-3333-3333-000000000023', 'todo', 'medium', '2026-06-10', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('START TRAINING BATCH 2', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-06-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('ALL SALES', '33333333-3333-3333-3333-000000000023', 'todo', 'medium', '2026-06-20', false);
INSERT INTO tasks (title, project_id, status, priority, due_date, is_checkpoint) VALUES 
  ('START TRAINING BATCH 3', '33333333-3333-3333-3333-000000000020', 'todo', 'medium', '2026-06-30', false);


-- Total: 204 tasks from 23 departments
