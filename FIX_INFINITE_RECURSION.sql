-- ============================================
-- Fix Infinite Recursion in RLS Policy
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This fixes the infinite recursion error

-- Step 1: Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Step 2: Create a SECURITY DEFINER function that bypasses RLS
-- This function can check admin status without triggering RLS recursion
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

-- Step 3: Create the policy using the function
-- The function bypasses RLS, so no recursion!
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (check_if_user_is_admin());

-- Step 4: Make sure your profile has is_admin = TRUE
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
-- You can find it by running: SELECT id, email FROM auth.users;
UPDATE profiles 
SET is_admin = TRUE 
WHERE id IN (
  'ae43f00b-4138-4baa-9bf2-897e5ee7abfe',
  '4a971da9-0c28-4943-a379-c4a29ca22136'
);

-- Step 5: Verify it works
-- After running this, try: SELECT * FROM profiles;
-- You should see all profiles if you're an admin

