-- Migration: Remove user constraints from flashcards table
-- Description: Makes user_id nullable and removes user-related constraints

-- Drop foreign key constraint from flashcards table
ALTER TABLE "flashcards" DROP CONSTRAINT IF EXISTS "flashcards_user_id_fkey";

-- Make user_id nullable
ALTER TABLE "flashcards" ALTER COLUMN "user_id" DROP NOT NULL;

-- Disable RLS on flashcards table
ALTER TABLE flashcards DISABLE ROW LEVEL SECURITY;

-- Drop RLS policies if they exist (for safety)
DROP POLICY IF EXISTS "Users can view their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can insert their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can update their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can delete their own flashcards" ON flashcards;