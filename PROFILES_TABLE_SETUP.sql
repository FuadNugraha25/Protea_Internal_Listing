-- ============================================
-- Supabase Profiles Table Setup
-- ============================================
-- Run this SQL in your Supabase SQL Editor to create the profiles table
-- This table will store agent profile information

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  full_name TEXT,
  agent_code TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create index for faster queries
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_name_idx ON profiles(name);
CREATE INDEX IF NOT EXISTS profiles_agent_code_idx ON profiles(agent_code);

-- ============================================
-- Admin can view all profiles
-- ============================================
-- This policy allows admins to view all profiles for the dropdown
-- Uses a SECURITY DEFINER function to prevent infinite recursion

-- Create function to check admin status (bypasses RLS)
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

-- Create policy using the function (no recursion!)
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (check_if_user_is_admin());

