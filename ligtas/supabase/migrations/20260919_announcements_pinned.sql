-- Adds `is_pinned` to `announcements`: a pinned announcement stays fixed on
-- the public Landing page's announcement section while the other slots
-- continue to rotate through the latest non-pinned announcements (see
-- src/pages/Landing.jsx). Defaults to `false`, so every existing
-- announcement keeps behaving exactly as it does today — nothing changes
-- publicly until an admin pins one via the new checkbox in the admin panel.
-- Run in Supabase Dashboard > SQL Editor.

alter table if exists public.announcements
  add column if not exists is_pinned boolean not null default false;

notify pgrst, 'reload schema';
