-- Fix for user signup trigger not creating profiles/organizations
-- Run this in Supabase SQL Editor

-- Step 1: Drop and recreate the trigger function with proper settings
DROP FUNCTION IF EXISTS create_org_for_new_user() CASCADE;

CREATE OR REPLACE FUNCTION create_org_for_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  org_slug TEXT;
  existing_profile_id UUID;
  existing_org_id UUID;
BEGIN
  -- Check if profile already exists
  SELECT id, organization_id INTO existing_profile_id, existing_org_id
  FROM profiles WHERE id = NEW.id;

  -- If profile exists with an organization, skip
  IF existing_profile_id IS NOT NULL AND existing_org_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Generate slug from email
  org_slug := LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '-')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);

  -- Create organization
  INSERT INTO organizations (name, slug, owner_id)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'name', 'My') || '''s Organization',
    org_slug,
    NEW.id
  )
  RETURNING id INTO new_org_id;

  -- Add user as owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner')
  ON CONFLICT (organization_id, user_id) DO NOTHING;

  -- Create or update profile with organization
  IF existing_profile_id IS NOT NULL THEN
    -- Update existing profile
    UPDATE profiles
    SET organization_id = new_org_id,
        name = COALESCE(NEW.raw_user_meta_data->>'name', name, SPLIT_PART(NEW.email, '@', 1)),
        email = NEW.email
    WHERE id = NEW.id;
  ELSE
    -- Create new profile
    INSERT INTO profiles (id, organization_id, email, name)
    VALUES (
      NEW.id,
      new_org_id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1))
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the signup
  RAISE WARNING 'create_org_for_new_user failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_org_for_new_user();

-- Step 3: Backfill existing users who are missing organizations/profiles
DO $$
DECLARE
  user_record RECORD;
  new_org_id UUID;
  org_slug TEXT;
  existing_org_id UUID;
BEGIN
  -- Find all users without an organization
  FOR user_record IN
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN organization_members om ON om.user_id = au.id
    WHERE om.id IS NULL
  LOOP
    -- Generate slug
    org_slug := LOWER(REPLACE(SPLIT_PART(user_record.email, '@', 1), '.', '-')) || '-' || SUBSTRING(user_record.id::TEXT, 1, 8);

    -- Create organization for this user
    INSERT INTO organizations (name, slug, owner_id)
    VALUES (
      COALESCE(user_record.raw_user_meta_data->>'name', 'My') || '''s Organization',
      org_slug,
      user_record.id
    )
    RETURNING id INTO new_org_id;

    -- Add as owner
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (new_org_id, user_record.id, 'owner')
    ON CONFLICT DO NOTHING;

    -- Update or create profile
    INSERT INTO profiles (id, organization_id, email, name)
    VALUES (
      user_record.id,
      new_org_id,
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'name', SPLIT_PART(user_record.email, '@', 1))
    )
    ON CONFLICT (id) DO UPDATE SET
      organization_id = EXCLUDED.organization_id,
      name = COALESCE(EXCLUDED.name, profiles.name),
      email = EXCLUDED.email;

    RAISE NOTICE 'Created org for user: %', user_record.email;
  END LOOP;
END $$;

-- Step 4: Verify the fix
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'name' as meta_name,
  p.name as profile_name,
  p.organization_id,
  om.role as org_role,
  o.name as org_name
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN organization_members om ON om.user_id = au.id
LEFT JOIN organizations o ON o.id = om.organization_id
ORDER BY au.created_at DESC;
