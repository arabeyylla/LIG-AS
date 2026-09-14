-- Creates `assessment_results`, the table backing the Assessment tab's
-- admin panel (results table, detail drawer, and analytics). Run in
-- Supabase Dashboard > SQL Editor, or apply via the Supabase CLI if this
-- project manages migrations that way.
--
-- NOTE ON SHAPE: the Assessment page asks 6 questions spanning 4 disaster
-- modules (Earthquake, Typhoon, Flood, General) in a single sitting. Rather
-- than cramming every module's questions into one row, the frontend inserts
-- ONE ROW PER MODULE per submission (so a single Pre-Assessment submit
-- writes 4 rows, all sharing the same `identifier` + `assessment_type` +
-- `created_at`). That is what makes `disaster_module` a genuinely queryable
-- column — SELECT/GROUP BY disaster_module gives real per-module pass
-- rates without parsing JSONB, and every other metric (avg score, avg
-- confidence) still aggregates correctly because every submission always
-- contributes the same number of rows. See src/pages/Assessment.jsx and
-- src/components/admin/AssessmentDetailModal.jsx (which regroups sibling
-- rows back into one "attempt" for display).
--
-- This supersedes the earlier `assessments` table from
-- 20260914_create_assessments.sql. That table is left untouched by this
-- migration — if it's no longer used, drop it yourself once you've
-- confirmed there's nothing worth keeping in it:
--   drop table if exists public.assessments;

create extension if not exists pgcrypto;

create table if not exists public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,   -- nullable; set once players can sign in
  identifier text not null,                                     -- student ID, email, or full name entered on the form
  assessment_type text not null check (assessment_type in ('pre-assessment', 'post-assessment')),
  disaster_module text not null check (disaster_module in ('Earthquake', 'Typhoon', 'Flood', 'General')),
  score integer not null default 0,
  total_questions integer not null default 0,
  answers_payload jsonb not null default '[]'::jsonb,           -- [{ questionId, question, selectedIndex, selectedText, correctIndex, isCorrect }]
  likert_preparedness_rating smallint check (likert_preparedness_rating between 1 and 5),
  created_at timestamptz not null default now()
);

create index if not exists assessment_results_identifier_idx on public.assessment_results (identifier);
create index if not exists assessment_results_type_idx on public.assessment_results (assessment_type);
create index if not exists assessment_results_module_idx on public.assessment_results (disaster_module);
create index if not exists assessment_results_created_at_idx on public.assessment_results (created_at desc);
-- Speeds up regrouping a module row back into its full attempt (same
-- identifier + assessment_type + created_at) in the admin detail modal.
create index if not exists assessment_results_attempt_idx on public.assessment_results (identifier, assessment_type, created_at);

alter table public.assessment_results enable row level security;

-- Anyone (including anonymous players on the public Assessment page) can
-- submit a result.
drop policy if exists "Public can submit assessment results" on public.assessment_results;
create policy "Public can submit assessment results"
  on public.assessment_results for insert
  to anon, authenticated
  with check (true);

-- Only signed-in accounts (the admin panel — see AdminRoute.jsx, which
-- treats any authenticated session as admin) can read results.
drop policy if exists "Admins can read assessment results" on public.assessment_results;
create policy "Admins can read assessment results"
  on public.assessment_results for select
  to authenticated
  using (true);

-- Only admins can delete a result (used by the "Delete record" action in
-- the admin table). No update policy is defined, so edits stay disallowed.
drop policy if exists "Admins can delete assessment results" on public.assessment_results;
create policy "Admins can delete assessment results"
  on public.assessment_results for delete
  to authenticated
  using (true);

notify pgrst, 'reload schema';
