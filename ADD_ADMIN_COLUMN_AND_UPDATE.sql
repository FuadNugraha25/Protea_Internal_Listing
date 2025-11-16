-- ============================================
-- Add is_admin column and update existing admins
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This adds the is_admin column and sets existing admins

-- Step 1: Add is_admin column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Step 2: Set existing admin users (update these UUIDs if needed)
UPDATE profiles 
SET is_admin = TRUE 
WHERE id IN (
  'ae43f00b-4138-4baa-9bf2-897e5ee7abfe',
  '4a971da9-0c28-4943-a379-c4a29ca22136'
);

-- Step 3: Drop the old hardcoded policy if it exists
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Step 4: Create a SECURITY DEFINER function to check admin status
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION check_if_user_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- This function runs with elevated privileges, so it bypasses RLS
  RETURN EXISTS (
    SELECT 1 
    FROM profiles
    WHERE id = auth.uid()
    AND is_admin = TRUE
  );
END;
$$;

-- Step 5: Create new policy using the function (no recursion!)
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (check_if_user_is_admin());

-- Step 6: Create index for faster admin checks
CREATE INDEX IF NOT EXISTS profiles_is_admin_idx ON profiles(is_admin) WHERE is_admin = TRUE;

