-- Migration: Create initial database schema
-- Tables created: generations, flashcards, generation_error_logs
-- This migration sets up the core tables for the 10xCards application.
-- It includes tables for storing flashcard generation data, the flashcards themselves,
-- and logs for any errors during generation. RLS is enabled on all tables.

-- create a function to automatically update 'updated_at' columns
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- create a trigger to call the function before any update
-- on tables that have an 'updated_at' column.
-- this is a general trigger, to be applied to tables later.

-----------------------------------------------------------------------
-- Table: generations
-----------------------------------------------------------------------

-- create the 'generations' table
create table public.generations (
    id bigserial primary key,
    user_id uuid not null references auth.users(id),
    model varchar not null,
    generated_count integer not null,
    accepted_unedited_count integer null,
    accepted_edited_count integer null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- add comments to the columns
comment on column public.generations.id is 'unique identifier for the generation record.';
comment on column public.generations.user_id is 'foreign key to the user who initiated the generation.';
comment on column public.generations.model is 'the model used for generation (e.g., gpt-4).';
comment on column public.generations.generated_count is 'number of flashcards generated in this batch.';
comment on column public.generations.accepted_unedited_count is 'number of flashcards accepted without edits.';
comment on column public.generations.accepted_edited_count is 'number of flashcards accepted after edits.';
comment on column public.generations.source_text_hash is 'hash of the source text to identify unique texts.';
comment on column public.generations.source_text_length is 'length of the source text, constrained between 1000 and 10000 characters.';
comment on column public.generations.generation_duration is 'duration of the generation process in seconds.';
comment on column public.generations.created_at is 'timestamp of when the record was created.';
comment on column public.generations.updated_at is 'timestamp of when the record was last updated.';

-- create trigger for 'updated_at'
create trigger on_generations_update
  before update on public.generations
  for each row execute procedure public.handle_updated_at();

-- enable row level security for the 'generations' table
alter table public.generations enable row level security;

-- create policies for 'generations' table
create policy "allow authenticated users to select their own generation records"
on public.generations for select
to authenticated
using (auth.uid() = user_id);

create policy "allow authenticated users to insert their own generation records"
on public.generations for insert
to authenticated
with check (auth.uid() = user_id);

create policy "allow authenticated users to update their own generation records"
on public.generations for update
to authenticated
using (auth.uid() = user_id);

create policy "allow authenticated users to delete their own generation records"
on public.generations for delete
to authenticated
using (auth.uid() = user_id);

-- create index on user_id
create index ix_generations_user_id on public.generations (user_id);


-----------------------------------------------------------------------
-- Table: flashcards
-----------------------------------------------------------------------

-- create the 'flashcards' table
create table public.flashcards (
    id bigserial primary key,
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar not null check (source in ('ai-full', 'ai-edited', 'manual')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    generation_id bigint references public.generations(id) on delete set null,
    user_id uuid not null references auth.users(id)
);

-- add comments to the columns
comment on column public.flashcards.id is 'unique identifier for the flashcard.';
comment on column public.flashcards.front is 'the front side of the flashcard (question).';
comment on column public.flashcards.back is 'the back side of the flashcard (answer).';
comment on column public.flashcards.source is 'source of the flashcard: ai-full, ai-edited, or manual.';
comment on column public.flashcards.created_at is 'timestamp of when the record was created.';
comment on column public.flashcards.updated_at is 'timestamp of when the record was last updated.';
comment on column public.flashcards.generation_id is 'foreign key to the generation batch, if applicable.';
comment on column public.flashcards.user_id is 'foreign key to the user who owns the flashcard.';

-- create trigger for 'updated_at'
create trigger on_flashcards_update
  before update on public.flashcards
  for each row execute procedure public.handle_updated_at();

-- enable row level security for the 'flashcards' table
alter table public.flashcards enable row level security;

-- create policies for 'flashcards' table
create policy "allow authenticated users to select their own flashcards"
on public.flashcards for select
to authenticated
using (auth.uid() = user_id);

create policy "allow authenticated users to insert their own flashcards"
on public.flashcards for insert
to authenticated
with check (auth.uid() = user_id);

create policy "allow authenticated users to update their own flashcards"
on public.flashcards for update
to authenticated
using (auth.uid() = user_id);

create policy "allow authenticated users to delete their own flashcards"
on public.flashcards for delete
to authenticated
using (auth.uid() = user_id);

-- create indexes
create index ix_flashcards_user_id on public.flashcards (user_id);
create index ix_flashcards_generation_id on public.flashcards (generation_id);

-----------------------------------------------------------------------
-- Table: generation_error_logs
-----------------------------------------------------------------------

-- create the 'generation_error_logs' table
create table public.generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id),
    model varchar not null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code varchar(100) not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- add comments to the columns
comment on column public.generation_error_logs.id is 'unique identifier for the error log.';
comment on column public.generation_error_logs.user_id is 'foreign key to the user who encountered the error.';
comment on column public.generation_error_logs.model is 'the model used for generation when the error occurred.';
comment on column public.generation_error_logs.source_text_hash is 'hash of the source text used when the error occurred.';
comment on column public.generation_error_logs.source_text_length is 'length of the source text used when the error occurred.';
comment on column public.generation_error_logs.error_code is 'a code for the type of error.';
comment on column public.generation_error_logs.error_message is 'the detailed error message.';
comment on column public.generation_error_logs.created_at is 'timestamp of when the error was logged.';

-- enable row level security for the 'generation_error_logs' table
alter table public.generation_error_logs enable row level security;

-- create policies for 'generation_error_logs' table
create policy "allow authenticated users to select their own error logs"
on public.generation_error_logs for select
to authenticated
using (auth.uid() = user_id);

create policy "allow authenticated users to insert their own error logs"
on public.generation_error_logs for insert
to authenticated
with check (auth.uid() = user_id);

-- No update or delete policies as logs should be immutable.

-- create index on user_id
create index ix_generation_error_logs_user_id on public.generation_error_logs (user_id);
