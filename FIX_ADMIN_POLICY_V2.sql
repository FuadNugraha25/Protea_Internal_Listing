-- ============================================
-- Fix Admin Policy - Using Security Definer Function
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This creates a function that can check admin status without RLS blocking

-- Step 1: Create a function to check if current user is admin
-- This function runs with SECURITY DEFINER so it can bypass RLS
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = TRUE
  );
END;
$$;

-- Step 2: Drop the old policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Step 3: Create new policy using the function
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (is_current_user_admin());

-- Step 4: Make sure your profile has is_admin = TRUE
-- First, let's see what your user ID is
-- Run this to see your current user ID (you need to be logged in):
-- SELECT auth.uid() as current_user_id;

-- Then set yourself as admin (replace with your actual user ID):
-- UPDATE profiles SET is_admin = TRUE WHERE id = auth.uid();

-- OR if you know your email, you can find your ID first:
-- SELECT p.id, p.email, p.is_admin 
-- FROM profiles p 
-- JOIN auth.users u ON p.id = u.id 
-- WHERE u.email = 'your-email@example.com';

-- Then update:
-- UPDATE profiles SET is_admin = TRUE WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

