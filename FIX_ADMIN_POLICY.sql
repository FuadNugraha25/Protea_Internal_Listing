-- ============================================
-- Fix Admin Policy - Better RLS Policy
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This fixes the RLS policy to properly allow admins to view all profiles

-- Step 1: Drop the existing policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Step 2: Create a better policy that checks the current user's profile
-- This uses a simpler approach that works better with RLS
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    -- Check if current user's profile has is_admin = TRUE
    -- This uses a subquery that should work with RLS
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
  );

-- Step 3: Make sure your profile has is_admin = TRUE
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID
-- You can find your user ID by running: SELECT id, email FROM auth.users;
-- Or check the browser console when logged in
UPDATE profiles 
SET is_admin = TRUE 
WHERE id = auth.uid();

-- Step 4: If you know your user ID, you can also run this directly:
-- UPDATE profiles SET is_admin = TRUE WHERE id = 'your-uuid-here';

