-- Add 6 companies for CEO dashboard
-- Run this in Supabase SQL Editor

-- First, let's see what companies already exist
-- SELECT * FROM companies;

-- Insert companies (will skip if name already exists)
INSERT INTO companies (name, industry, color)
VALUES
  ('NovaCube', 'Technology', '#3B82F6')
ON CONFLICT (name) DO NOTHING;

INSERT INTO companies (name, industry, color)
VALUES
  ('Company 2', 'Technology', '#10B981')
ON CONFLICT (name) DO NOTHING;

INSERT INTO companies (name, industry, color)
VALUES
  ('Company 3', 'Technology', '#F59E0B')
ON CONFLICT (name) DO NOTHING;

INSERT INTO companies (name, industry, color)
VALUES
  ('Company 4', 'Technology', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

INSERT INTO companies (name, industry, color)
VALUES
  ('Company 5', 'Technology', '#EF4444')
ON CONFLICT (name) DO NOTHING;

INSERT INTO companies (name, industry, color)
VALUES
  ('Company 6', 'Technology', '#EC4899')
ON CONFLICT (name) DO NOTHING;

-- Verify all 6 companies exist
SELECT id, name, industry, color FROM companies ORDER BY name;
