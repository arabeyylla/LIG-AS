-- Row Level Security for `announcements`, and a server-side limit for the
-- "Questions per attempt" setting.
--
-- 1. Announcements
--    The table was created in the Supabase dashboard, so its policies were
--    never in a migration. With RLS on and no DELETE policy, Postgres does not
--    raise an error — it simply deletes 0 rows. The admin page showed
--    "Announcement deleted." while the row stayed, so delete looked broken.
--    These policies give signed-in admins full write access and keep public
--    read access. Public reads are NOT limited to `is_active` rows on purpose:
--    Realtime only delivers changes the reader may see, so hiding an
--    announcement would never reach open Landing pages. The pages filter
--    hidden rows themselves.
--
-- 2. assessment_questions_per_attempt
--    The admin form now validates the number, but the setting lives in a
--    writable key/value table. This check makes 1–50 a hard limit even if the
--    value is written some other way.
--
-- Run in the Supabase SQL editor.

-- 1. Announcements ------------------------------------------------------------------
alter table public.announcements enable row level security;

drop policy if exists "Public can read announcements" on public.announcements;
create policy "Public can read announcements"
  on public.announcements for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can create announcements" on public.announcements;
create policy "Admins can create announcements"
  on public.announcements for insert
  to authenticated
  with check (true);

drop policy if exists "Admins can update announcements" on public.announcements;
create policy "Admins can update announcements"
  on public.announcements for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admins can delete announcements" on public.announcements;
create policy "Admins can delete announcements"
  on public.announcements for delete
  to authenticated
  using (true);

grant select on public.announcements to anon;
grant select, insert, update, delete on public.announcements to authenticated;

-- 2. Questions per attempt: whole number from 1 to 50 -------------------------------
-- Repair an out-of-range value first so the constraint can be added.
update public.site_settings
   set value = '10'::jsonb, updated_at = now()
 where key = 'assessment_questions_per_attempt'
   and not (jsonb_typeof(value) = 'number' and (value::text)::numeric between 1 and 50
            and (value::text)::numeric = floor((value::text)::numeric));

alter table public.site_settings
  drop constraint if exists site_settings_questions_per_attempt_range;
alter table public.site_settings
  add constraint site_settings_questions_per_attempt_range check (
    key <> 'assessment_questions_per_attempt'
    or (
      jsonb_typeof(value) = 'number'
      and (value::text)::numeric between 1 and 50
      and (value::text)::numeric = floor((value::text)::numeric)
    )
  );

notify pgrst, 'reload schema';
