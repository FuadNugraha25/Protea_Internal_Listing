-- ============================================
-- Enable Admin Access to All Profiles (Using is_admin column)
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This uses the is_admin column instead of hardcoded UUIDs

-- Drop old policy if it exists
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create new policy using is_admin column
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = TRUE
    )
  );

-- Create index for faster admin checks
CREATE INDEX IF NOT EXISTS profiles_is_admin_idx ON profiles(is_admin) WHERE is_admin = TRUE;
