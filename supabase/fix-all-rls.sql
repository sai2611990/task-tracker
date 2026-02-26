-- COMPREHENSIVE RLS FIX
-- Fixes all table policies to avoid recursion and properly allow CRUD operations

-- ============================================
-- STEP 1: Create helper function to get user's org IDs without recursion
-- ============================================
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
$$;

-- ============================================
-- STEP 2: Fix error_logs table (allow anonymous inserts for error logging)
-- ============================================
ALTER TABLE IF EXISTS error_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert errors" ON error_logs;
DROP POLICY IF EXISTS "Service role can read errors" ON error_logs;

-- Allow anyone to insert errors (for error logging to work)
CREATE POLICY "Anyone can insert errors" ON error_logs
  FOR INSERT WITH CHECK (true);

-- Only service role can read (handled by service role key)
CREATE POLICY "Service role can read errors" ON error_logs
  FOR SELECT USING (auth.role() = 'service_role');

-- ============================================
-- STEP 3: Fix organizations table
-- ============================================
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Owners can update organizations" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;

CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (id IN (SELECT get_user_org_ids()));

CREATE POLICY "Owners can update organizations" ON organizations
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- ============================================
-- STEP 4: Fix organization_members table
-- ============================================
DROP POLICY IF EXISTS "Users can view org members" ON organization_members;
DROP POLICY IF EXISTS "Users can insert org members" ON organization_members;

CREATE POLICY "Users can view org members" ON organization_members
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Owners can manage org members" ON organization_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = organization_members.organization_id
      AND o.owner_id = auth.uid()
    )
  );

-- ============================================
-- STEP 5: Fix companies table
-- ============================================
DROP POLICY IF EXISTS "Users can view companies" ON companies;
DROP POLICY IF EXISTS "Users can view companies in their org" ON companies;
DROP POLICY IF EXISTS "Users can insert companies" ON companies;
DROP POLICY IF EXISTS "Users can insert companies in their org" ON companies;
DROP POLICY IF EXISTS "Users can update companies" ON companies;
DROP POLICY IF EXISTS "Users can delete companies" ON companies;

CREATE POLICY "Users can view companies in their org" ON companies
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can insert companies in their org" ON companies
  FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can update companies in their org" ON companies
  FOR UPDATE USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can delete companies in their org" ON companies
  FOR DELETE USING (organization_id IN (SELECT get_user_org_ids()));

-- ============================================
-- STEP 6: Fix departments table
-- ============================================
DROP POLICY IF EXISTS "Users can view departments" ON departments;
DROP POLICY IF EXISTS "Users can view departments in their org" ON departments;
DROP POLICY IF EXISTS "Users can insert departments" ON departments;
DROP POLICY IF EXISTS "Users can update departments" ON departments;
DROP POLICY IF EXISTS "Users can delete departments" ON departments;

CREATE POLICY "Users can view departments in their org" ON departments
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can insert departments in their org" ON departments
  FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can update departments in their org" ON departments
  FOR UPDATE USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can delete departments in their org" ON departments
  FOR DELETE USING (organization_id IN (SELECT get_user_org_ids()));

-- ============================================
-- STEP 7: Fix profiles table
-- ============================================
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their org" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view profiles in their org" ON profiles
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================
-- STEP 8: Fix timeline_tasks table
-- ============================================
DROP POLICY IF EXISTS "Users can view timeline_tasks" ON timeline_tasks;
DROP POLICY IF EXISTS "Users can view tasks in their org" ON timeline_tasks;
DROP POLICY IF EXISTS "Users can insert tasks" ON timeline_tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON timeline_tasks;
DROP POLICY IF EXISTS "Users can delete tasks" ON timeline_tasks;

CREATE POLICY "Users can view tasks in their org" ON timeline_tasks
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can insert tasks in their org" ON timeline_tasks
  FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can update tasks in their org" ON timeline_tasks
  FOR UPDATE USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can delete tasks in their org" ON timeline_tasks
  FOR DELETE USING (organization_id IN (SELECT get_user_org_ids()));

-- ============================================
-- STEP 9: Fix department_targets table
-- ============================================
DROP POLICY IF EXISTS "Users can view department_targets" ON department_targets;
DROP POLICY IF EXISTS "Users can view targets in their org" ON department_targets;
DROP POLICY IF EXISTS "Users can insert targets" ON department_targets;
DROP POLICY IF EXISTS "Users can update targets" ON department_targets;
DROP POLICY IF EXISTS "Users can delete targets" ON department_targets;

CREATE POLICY "Users can view targets in their org" ON department_targets
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can insert targets in their org" ON department_targets
  FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can update targets in their org" ON department_targets
  FOR UPDATE USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can delete targets in their org" ON department_targets
  FOR DELETE USING (organization_id IN (SELECT get_user_org_ids()));

-- ============================================
-- STEP 10: Verify user's org membership
-- ============================================
SELECT
  au.email,
  p.name as profile_name,
  om.organization_id,
  om.role as org_role,
  o.name as org_name
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN organization_members om ON om.user_id = au.id
LEFT JOIN organizations o ON o.id = om.organization_id
ORDER BY au.created_at DESC;
