-- Migration: Fix source_text_length type
-- Description: Changes source_text_length from text to integer

-- Drop existing check constraint
ALTER TABLE generations DROP CONSTRAINT IF EXISTS generations_source_text_length_check;

-- Convert column type directly
ALTER TABLE generations
    ALTER COLUMN source_text_length TYPE integer
    USING (
        NULLIF(regexp_replace(source_text_length, '[^0-9]', '', 'g'), '')::integer
    );

-- Add check constraint
ALTER TABLE generations
    ADD CONSTRAINT generations_source_text_length_check
    CHECK (source_text_length BETWEEN 1 AND 10000);
