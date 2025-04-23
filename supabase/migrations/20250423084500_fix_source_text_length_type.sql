-- Drop the existing check constraint first
ALTER TABLE generations
    DROP CONSTRAINT IF EXISTS generations_source_text_length_check;

-- Change the column type to INTEGER
ALTER TABLE generations
    ALTER COLUMN source_text_length TYPE INTEGER
    USING (CASE
        WHEN source_text_length ~ '^[0-9]+$' THEN source_text_length::INTEGER
        ELSE 0
    END);

-- Add the new check constraint
ALTER TABLE generations
    ADD CONSTRAINT generations_source_text_length_check
    CHECK (source_text_length BETWEEN 1000 AND 10000);
