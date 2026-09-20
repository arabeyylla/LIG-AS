-- Category-based Assessment flow.
--
-- The public Assessment page asks the player to pick ONE disaster category
-- (Earthquake, Typhoon, Landslide, Tsunami, Volcanic Eruption, General
-- Preparedness) and draws a single randomized set of questions for it.
-- Results are saved as ONE ROW PER ATTEMPT with `disaster_module` = the chosen
-- category, which is what lets the admin Analytics tab compute Pre vs. Post
-- averages and Knowledge Gain per category with a plain GROUP BY.
--
-- Column mapping to the "category / type" naming used in the feature brief
-- (existing columns are kept so live data and admin pages keep working):
--   assessment_questions.module          = category  ('Earthquake', 'Tsunami', ...)
--   assessment_questions.assessment_type = type      ('pre-assessment' | 'post-assessment')
--   assessment_results.disaster_module   = category
--   assessment_results.assessment_type   = type
--   assessment_results.identifier        = student_id
--
-- This migration:
--   1. Replaces the category CHECK constraints on both tables with the
--      current list. The constraints are added NOT VALID, so they are enforced
--      for every new insert/update but existing rows are not re-checked:
--      historical 'Flood' questions/results (and any 'Fire Safety' rows from
--      an earlier draft of this migration) are kept intact instead of being
--      deleted or blocking the migration. The admin Question Bank still lists
--      such legacy questions so they can be reviewed or deleted.
--   2. Adds a composite index for per-category analytics.
--   3. Seeds two admin-editable settings in `site_settings`:
--        assessment_enabled_categories     { "<category>": boolean } — which
--                                          categories appear on the public picker
--        assessment_questions_per_attempt  number of questions drawn per attempt
--
-- Run in Supabase Dashboard > SQL Editor. Safe to re-run: admin toggles that
-- already exist are preserved.
--
-- To also remove the old seeded Flood questions (optional, irreversible):
--   delete from public.assessment_questions where module = 'Flood';

-- 1. Replace the category CHECK constraints ---------------------------------
-- The original constraints were created inline (auto-named), so find them by
-- definition instead of relying on a generated name.
do $$
declare
  c record;
begin
  for c in
    select conrelid::regclass as tbl, conname
    from pg_constraint
    where contype = 'c'
      and conrelid in ('public.assessment_questions'::regclass, 'public.assessment_results'::regclass)
      and pg_get_constraintdef(oid) ilike '%''Earthquake''%'
  loop
    execute format('alter table %s drop constraint %I', c.tbl, c.conname);
  end loop;
end
$$;

alter table public.assessment_questions
  add constraint assessment_questions_module_check
  check (module in ('Earthquake', 'Typhoon', 'Landslide', 'Tsunami', 'Volcanic Eruption', 'General'))
  not valid;

alter table public.assessment_results
  add constraint assessment_results_disaster_module_check
  check (disaster_module in ('Earthquake', 'Typhoon', 'Landslide', 'Tsunami', 'Volcanic Eruption', 'General'))
  not valid;

-- 2. Per-category analytics -------------------------------------------------
create index if not exists assessment_results_type_module_created_idx
  on public.assessment_results (assessment_type, disaster_module, created_at desc);

-- 3. Admin-editable settings (site_settings is publicly readable, admin-writable)
-- The new categories start hidden: none of them has questions yet, and the
-- admin switches each one on from Assessment > Question Bank once it does.
-- On re-run, `excluded.value || existing` keeps every toggle the admin already
-- set (right-hand side wins), adds any new category keys, and drops the
-- retired 'Flood' / 'Fire Safety' keys.
insert into public.site_settings (key, value) values
  ('assessment_enabled_categories',
   '{"Earthquake": true, "Typhoon": true, "Landslide": false, "Tsunami": false, "Volcanic Eruption": false, "General": true}'),
  ('assessment_questions_per_attempt', '10')
on conflict (key) do update
  set value = case
        when public.site_settings.key = 'assessment_enabled_categories'
          then excluded.value || (public.site_settings.value - 'Flood' - 'Fire Safety')
        else public.site_settings.value
      end,
      updated_at = now();

notify pgrst, 'reload schema';
