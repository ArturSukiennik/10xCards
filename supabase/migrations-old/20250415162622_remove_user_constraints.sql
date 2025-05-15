-- Migration: Remove user constraints
-- Description: Removes user foreign key constraints and makes user_id nullable

-- Drop foreign key constraint from generations table
ALTER TABLE "generations" DROP CONSTRAINT IF EXISTS "generations_user_id_fkey";

-- Make user_id nullable
ALTER TABLE "generations" ALTER COLUMN "user_id" DROP NOT NULL;

-- Drop RLS policies if they exist (for safety)
DROP POLICY IF EXISTS "Users can view their own generations" ON generations;
DROP POLICY IF EXISTS "Users can insert their own generations" ON generations;
DROP POLICY IF EXISTS "Users can update their own generations" ON generations;

-- Disable RLS on generations table
ALTER TABLE generations DISABLE ROW LEVEL SECURITY;
