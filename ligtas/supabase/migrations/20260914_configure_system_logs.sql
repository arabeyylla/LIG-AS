-- Run in Supabase Dashboard > SQL Editor. It is safe to run when
-- public.system_logs already exists and is currently empty.
alter table public.system_logs
  add column if not exists action text,
  add column if not exists entity_type text,
  add column if not exists entity_id text,
  add column if not exists details jsonb not null default '{}'::jsonb,
  add column if not exists actor_id uuid references auth.users(id) on delete set null,
  add column if not exists actor_email text,
  add column if not exists created_at timestamptz not null default now();

create index if not exists system_logs_created_at_idx
  on public.system_logs (created_at desc);

alter table public.system_logs enable row level security;

-- Public pages need to write page-view and feedback events. Keep read access
-- restricted to signed-in admin accounts.
drop policy if exists "Admins can read system logs" on public.system_logs;
create policy "Admins can read system logs"
  on public.system_logs for select to authenticated using (true);

drop policy if exists "App can write system logs" on public.system_logs;
create policy "App can write system logs"
  on public.system_logs for insert to anon, authenticated with check (true);
