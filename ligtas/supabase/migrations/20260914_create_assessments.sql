-- Creates a single `assessments` table used for BOTH the Pre-Assessment and
-- Post-Assessment forms, differentiated by the `assessment_type` column.
-- A shared table keeps it simple to link a participant's pre- and
-- post-scores together by `participant_id` for before/after comparisons.
-- Run in Supabase Dashboard > SQL Editor, or apply via the Supabase CLI if
-- this project manages migrations that way.

create extension if not exists pgcrypto;

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  participant_id text not null,                    -- student ID, email, or full name supplied by the player
  assessment_type text not null check (assessment_type in ('pre', 'post')),
  answers jsonb not null default '{}'::jsonb,       -- { [questionId]: selectedOptionIndex }
  score integer not null default 0,                 -- number of correct MCQ answers
  total_questions integer not null default 0,
  confidence_rating smallint check (confidence_rating between 1 and 5), -- Likert self-evaluation
  created_at timestamptz not null default now()
);

create index if not exists assessments_participant_idx on public.assessments (participant_id);
create index if not exists assessments_type_idx on public.assessments (assessment_type);
create index if not exists assessments_created_at_idx on public.assessments (created_at desc);

alter table public.assessments enable row level security;

-- Anyone (including anonymous players) can submit an assessment.
drop policy if exists "Public can submit assessments" on public.assessments;
create policy "Public can submit assessments"
  on public.assessments for insert
  to anon, authenticated
  with check (true);

-- Only signed-in accounts (the admin dashboard, see AdminRoute.jsx) can read
-- results. There are no update/delete policies, so those stay fully denied.
drop policy if exists "Admins can read assessments" on public.assessments;
create policy "Admins can read assessments"
  on public.assessments for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Alternative schema (not applied by this migration): if you'd rather keep
-- Pre- and Post-Assessment records in separate tables instead of one table
-- with an `assessment_type` column, mirror `assessments` twice, e.g.:
--
--   create table public.pre_assessments  (... same columns, minus assessment_type ...);
--   create table public.post_assessments (... same columns, minus assessment_type ...);
--
-- with the same RLS policies (public insert / authenticated select) on each,
-- and update the two `supabase.from('assessments')` calls in
-- src/pages/Assessment.jsx to `pre_assessments` / `post_assessments`.
-- ---------------------------------------------------------------------------
