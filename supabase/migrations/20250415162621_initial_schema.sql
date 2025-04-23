-- Migration: Initial Schema Creation
-- Description: Creates the initial database schema for the flashcards application
-- Tables: generations, flashcards, generation_error_logs
-- Note: users table is managed by Supabase Auth

-- Create tables
create table "generations" (
    "id" bigserial primary key,
    "user_id" uuid not null references auth.users(id) on delete restrict,
    "model" varchar(50) not null,
    "generated_count" integer not null,
    "generated_unedited_count" integer,
    "accepted_edited_count" integer,
    "source_text_hash" varchar(64) not null,
    "generation_duration" integer not null,
    "source_text_length" text not null check (char_length(source_text_length) between 1000 and 10000),
    "created_at" timestamptz not null default current_timestamp,
    "updated_at" timestamptz not null default current_timestamp
);

create table "flashcards" (
    "id" bigserial primary key,
    "user_id" uuid not null references auth.users(id) on delete restrict,
    "front" varchar(200) not null,
    "back" varchar(500) not null,
    "source" varchar(20) not null check (source in ('ai-full', 'ai-edited', 'manual')),
    "generation_id" bigint not null references generations(id),
    "created_at" timestamptz not null default current_timestamp,
    "updated_at" timestamptz not null default current_timestamp
);

create table "generation_error_logs" (
    "id" bigserial primary key,
    "user_id" uuid not null references auth.users(id) on delete restrict,
    "model" varchar(50) not null,
    "source_text_hash" varchar(64) not null,
    "source_text_length" integer not null check (source_text_length between 1000 and 10000),
    "error_code" varchar(100) not null,
    "error_message" text not null,
    "created_at" timestamptz not null default current_timestamp
);

-- Create indexes for foreign keys
create index generations_user_id_idx on generations(user_id);
create index flashcards_user_id_idx on flashcards(user_id);
create index flashcards_generation_id_idx on flashcards(generation_id);
create index generation_error_logs_user_id_idx on generation_error_logs(user_id);

-- Enable Row Level Security
alter table generations disable row level security;
alter table flashcards enable row level security;
alter table generation_error_logs enable row level security;

-- Create RLS Policies for generations table
create policy "Users can view their own generations"
    on generations for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own generations"
    on generations for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own generations"
    on generations for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Create RLS Policies for flashcards table
create policy "Users can view their own flashcards"
    on flashcards for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own flashcards"
    on flashcards for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
    on flashcards for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
    on flashcards for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create RLS Policies for generation_error_logs table
create policy "Users can view their own error logs"
    on generation_error_logs for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own error logs"
    on generation_error_logs for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Create function for updating timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = current_timestamp;
    return new;
end;
$$ language plpgsql;

-- Create triggers for updating timestamps
create trigger update_generations_updated_at
    before update on generations
    for each row
    execute function update_updated_at_column();

create trigger update_flashcards_updated_at
    before update on flashcards
    for each row
    execute function update_updated_at_column();

-- Drop all policies
drop policy if exists "Users can view their own generations" on generations;
drop policy if exists "Users can insert their own generations" on generations;
drop policy if exists "Users can update their own generations" on generations;

drop policy if exists "Users can view their own flashcards" on flashcards;
drop policy if exists "Users can insert their own flashcards" on flashcards;
drop policy if exists "Users can update their own flashcards" on flashcards;
drop policy if exists "Users can delete their own flashcards" on flashcards;

drop policy if exists "Users can view their own error logs" on generation_error_logs;
drop policy if exists "Users can insert their own error logs" on generation_error_logs;