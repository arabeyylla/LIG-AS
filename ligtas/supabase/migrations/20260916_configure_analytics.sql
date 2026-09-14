-- Page-visit and download counters used by the public site and admin
-- Analytics tab. Run in Supabase Dashboard > SQL Editor.
create table if not exists public.page_visits (
  page_name text primary key,
  count bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.downloads (
  id smallint primary key default 1 check (id = 1),
  total bigint not null default 0,
  last_download timestamptz
);

alter table public.page_visits enable row level security;
alter table public.downloads enable row level security;

drop policy if exists "Admins can read page visits" on public.page_visits;
create policy "Admins can read page visits"
  on public.page_visits for select to authenticated using (true);

drop policy if exists "Admins can read downloads" on public.downloads;
create policy "Admins can read downloads"
  on public.downloads for select to authenticated using (true);

create or replace function public.increment_page_visit(page text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.page_visits (page_name, count, updated_at)
  values (page, 1, now())
  on conflict (page_name) do update
    set count = public.page_visits.count + 1,
        updated_at = now();
end;
$$;

create or replace function public.increment_download()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.downloads (id, total, last_download)
  values (1, 1, now())
  on conflict (id) do update
    set total = public.downloads.total + 1,
        last_download = now();
end;
$$;

grant execute on function public.increment_page_visit(text) to anon, authenticated;
grant execute on function public.increment_download() to anon, authenticated;

notify pgrst, 'reload schema';
