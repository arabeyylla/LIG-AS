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
