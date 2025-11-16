-- ============================================
-- Diagnose and Fix Admin Access Issue
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This will help diagnose and fix the admin access issue

-- Step 1: Check if is_admin column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'is_admin';

-- Step 2: See all profiles and their admin status
SELECT id, email, name, is_admin 
FROM profiles 
ORDER BY created_at DESC;

-- Step 3: Check your current user ID (if logged in via Supabase dashboard)
-- Note: This only works if you're running this as the authenticated user
SELECT auth.uid() as current_user_id;

-- Step 4: Set yourself as admin
-- Option A: If you know your user ID, replace 'YOUR_USER_ID' below:
-- UPDATE profiles SET is_admin = TRUE WHERE id = 'YOUR_USER_ID';

-- Option B: If you know your email, use this:
-- UPDATE profiles 
-- SET is_admin = TRUE 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- Step 5: Fix the RLS policy using a simpler approach
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a function-based policy that works better
CREATE OR REPLACE FUNCTION check_user_is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND is_admin = TRUE
  );
END;
$$;

-- Create policy using the function
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (check_user_is_admin(auth.uid()));

-- Step 6: Verify the policy works
-- After setting is_admin = TRUE for your profile, try:
-- SELECT * FROM profiles;
-- You should see all profiles if you're an admin

