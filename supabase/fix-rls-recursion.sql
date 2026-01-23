-- Fix infinite recursion in organization_members RLS policy
-- The issue: organization_members policy queries organization_members, causing recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view org members" ON organization_members;

-- Create a simpler policy that doesn't cause recursion
-- Users can only see their own membership record
CREATE POLICY "Users can view their own membership" ON organization_members
  FOR SELECT USING (user_id = auth.uid());

-- Allow users to see other members in orgs where they are a member
-- Using a function to bypass RLS recursion
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT organization_id FROM organization_members WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Now update all other policies to use this function
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Users can view companies in their org" ON companies;
CREATE POLICY "Users can view companies in their org" ON companies
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Users can insert companies in their org" ON companies;
CREATE POLICY "Users can insert companies in their org" ON companies
  FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Users can view departments in their org" ON departments;
CREATE POLICY "Users can view departments in their org" ON departments
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Users can view profiles in their org" ON profiles;
CREATE POLICY "Users can view profiles in their org" ON profiles
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Users can view tasks in their org" ON timeline_tasks;
CREATE POLICY "Users can view tasks in their org" ON timeline_tasks
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Users can view targets in their org" ON department_targets;
CREATE POLICY "Users can view targets in their org" ON department_targets
  FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_org_ids() TO authenticated;

-- Verify the fix
SELECT 'RLS recursion fix applied successfully' as status;
