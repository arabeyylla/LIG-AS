-- Redesigns `page_visits` from a per-page COUNTER table (one row per page,
-- with a running `count` column) into a per-visit EVENT LOG (one row per
-- page view). This is what makes
--   supabase.from('page_visits').select('*', { count: 'exact', head: true })
-- a correct "Total Page Visits" query — with the old counter design, that
-- same call would have returned the number of distinct pages tracked
-- (~6), not the number of visits. It also unlocks analytics a counter
-- table can't support later on (visits over time, unique visitors, etc.).
--
-- DESTRUCTIVE: this drops the old counter-based `page_visits` table and its
-- `increment_page_visit` RPC. Its rows only ever held aggregate counts per
-- page, never individual visit history, so there is nothing meaningful to
-- carry forward — if you want a record of the pre-migration totals, run
-- `select * from public.page_visits` and save the output before applying
-- this. Run in Supabase Dashboard > SQL Editor.

drop function if exists public.increment_page_visit(text);
drop table if exists public.page_visits cascade;

create extension if not exists pgcrypto;

create table public.page_visits (
  id uuid primary key default gen_random_uuid(),
  page_name text not null,
  visited_at timestamptz not null default now()
);

create index if not exists page_visits_page_name_idx on public.page_visits (page_name);
create index if not exists page_visits_visited_at_idx on public.page_visits (visited_at desc);

alter table public.page_visits enable row level security;

-- Any visitor (anonymous or signed in) can log a page view directly —
-- no RPC needed now that this is a plain insert-only event log.
drop policy if exists "Public can log page visits" on public.page_visits;
create policy "Public can log page visits"
  on public.page_visits for insert
  to anon, authenticated
  with check (true);

-- Only admins (the admin panel — any authenticated session, see
-- AdminRoute.jsx) can read visit history/analytics.
drop policy if exists "Admins can read page visits" on public.page_visits;
create policy "Admins can read page visits"
  on public.page_visits for select
  to authenticated
  using (true);

notify pgrst, 'reload schema';
