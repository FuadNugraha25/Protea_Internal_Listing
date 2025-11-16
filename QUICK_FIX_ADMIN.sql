-- ============================================
-- Quick Fix for Admin Access
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This is the simplest fix that should work

-- Step 1: Make sure is_admin column exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Step 2: Set the admin users (replace with your actual user IDs)
-- You can find your user ID in the browser console or from auth.users table
UPDATE profiles 
SET is_admin = TRUE 
WHERE id IN (
  'ae43f00b-4138-4baa-9bf2-897e5ee7abfe',  -- Fuad
  '4a971da9-0c28-4943-a379-c4a29ca22136'   -- Other admin
);

-- Step 3: Drop old policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Step 4: Create simple, working policy
-- This policy allows viewing all profiles if your own profile has is_admin = TRUE
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    -- Allow if user can see their own profile AND it has is_admin = TRUE
    -- The "Users can view own profile" policy allows seeing own profile
    -- So we check if the current user's profile (which they can see) has is_admin = TRUE
    EXISTS (
      SELECT 1 
      FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.is_admin = TRUE
    )
  );

-- Step 5: Test - Check if you can see profiles
-- Run this query to test (you should see all profiles if you're admin):
-- SELECT id, email, name, is_admin FROM profiles;

