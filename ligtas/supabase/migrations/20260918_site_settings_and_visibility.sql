-- Adds:
--   1. `site_settings` — small admin-editable key/value store, publicly
--      readable, used to configure how many recent Announcements/Gallery
--      items show on the public Landing page.
--   2. `is_active` on `announcements` and `gallery` — lets admins hide an
--      item from the public site without deleting it.
--
-- Both additions default to values that reproduce CURRENT behavior:
--   - `is_active` defaults to `true`, so every existing row stays visible
--     exactly as it is today — nothing changes on the public site until an
--     admin explicitly hides something with the new toggle.
--   - The display-count settings default to 5 (announcements) and 6
--     (gallery), comfortably above what a typical site has today, so the
--     Landing page keeps showing everything it currently shows.
--
-- Run in Supabase Dashboard > SQL Editor.

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
  on public.site_settings for all
  to authenticated
  using (true)
  with check (true);

insert into public.site_settings (key, value) values
  ('announcements_display_count', '5'),
  ('gallery_display_count', '6')
on conflict (key) do nothing;

-- `is_active`: existing rows default to `true` (visible), so this is
-- purely additive — no current behavior changes until an admin uses the
-- new toggle. `if exists` guards these two ALTERs in case either table's
-- migration hasn't been applied to this project the same way.
alter table if exists public.announcements
  add column if not exists is_active boolean not null default true;

alter table if exists public.gallery
  add column if not exists is_active boolean not null default true;

notify pgrst, 'reload schema';
