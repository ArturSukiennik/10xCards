-- Disable RLS temporarily to allow the migration
alter table generations disable row level security;
alter table generation_error_logs disable row level security;

-- Create temporary column
alter table generations add column source_text_length_new integer;
alter table generation_error_logs add column source_text_length_new integer;

-- Copy data with conversion
update generations set source_text_length_new = char_length(source_text_length::text);
update generation_error_logs set source_text_length_new = char_length(source_text_length::text);

-- Drop old column and rename new one
alter table generations drop column source_text_length;
alter table generations rename column source_text_length_new to source_text_length;
alter table generations alter column source_text_length set not null;
alter table generations add constraint generations_source_text_length_check check (source_text_length between 1000 and 10000);

alter table generation_error_logs drop column source_text_length;
alter table generation_error_logs rename column source_text_length_new to source_text_length;
alter table generation_error_logs alter column source_text_length set not null;
alter table generation_error_logs add constraint generation_error_logs_source_text_length_check check (source_text_length between 1000 and 10000);

-- Re-enable RLS
alter table generations disable row level security;
alter table generation_error_logs enable row level security;
