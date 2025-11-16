-- ============================================
-- Migration Script: Rename phone to agent_code
-- ============================================
-- Run this SQL in your Supabase SQL Editor if you already have a profiles table
-- This will rename the 'phone' column to 'agent_code'

-- Step 1: Rename the column from phone to agent_code
ALTER TABLE profiles 
RENAME COLUMN phone TO agent_code;

-- Step 2: Update the index (if it exists)
DROP INDEX IF EXISTS profiles_phone_idx;
CREATE INDEX IF NOT EXISTS profiles_agent_code_idx ON profiles(agent_code);

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify the column was renamed successfully:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name IN ('phone', 'agent_code');

