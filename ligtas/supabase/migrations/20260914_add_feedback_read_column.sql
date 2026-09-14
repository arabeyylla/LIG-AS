-- Run this migration in Supabase Dashboard > SQL Editor if it is not
-- applied through the Supabase CLI. The admin feedback inbox uses this
-- column to mark messages as read or unread.
alter table public.feedback
  add column if not exists read boolean not null default false;
