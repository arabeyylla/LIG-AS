-- Game Code syncing between the web portal and the Unity mobile app.
--
--   Web:   Pre-Test -> Game Code -> (play in Unity) -> Post-Test -> Final Results
--   Unity: enter Game Code -> validate -> play scenario -> upload evaluation
--
-- SECURITY MODEL
-- Both the web app and the Unity app are anonymous (anon key), and the Game
-- Code is the only credential either one has. So the new tables grant NO
-- direct access to `anon`: if `select using (true)` were exposed, anyone could
-- list every code plus participants' student IDs / emails. Instead, anonymous
-- clients call the SECURITY DEFINER functions below, each of which needs the
-- code and returns only that one session's data (never the participant
-- identifier). Only signed-in admins can read the tables / admin view directly.
-- Rules such as "Post-Test only after the game is uploaded" and "one Post-Test
-- per session" are enforced here in the database, not just hidden in the UI.
--
-- Game Codes are 6 characters from an unambiguous 32-character alphabet
-- (no 0/O/1/I), generated with pgcrypto: ~1 billion combinations, so they
-- cannot be guessed by trying a few. (A "module prefix + 3 digits" scheme
-- like LND821 would only give 1,000 codes per module.)
--
-- PUBLIC RPCs (all return jsonb `{ ok: true, ... }` or `{ ok: false, error }`,
-- always HTTP 200, so clients branch on `ok` instead of parsing HTTP errors):
--   submit_pre_test      web    save the Pre-Test + create the session/code
--   get_session          web    status + scores for one code (resume, polling, final report)
--   submit_post_test     web    save the Post-Test (only once the game is uploaded)
--   validate_game_code   Unity  is this code playable? -> module
--   submit_game_result   Unity  upload the evaluation; idempotent for offline retries
--
-- SESSION LIFECYCLE
--   waiting_for_game -> completed_game -> post_completed
--   'expired' is derived at read time: a session still waiting_for_game after
--   `expired_at` (2 days after creation) that no device ever validated. The
--   value also exists in the enum so a scheduled job could persist it.
--   A code that was validated before expiry may still UPLOAD after it, so a
--   player who finished offline is not punished for syncing late.
--
-- Run in Supabase Dashboard > SQL Editor after 20260921_assessment_categories.sql.
-- Safe to re-run.

create extension if not exists pgcrypto;

-- 1. Status enum ---------------------------------------------------------------
do $$
begin
  create type public.assessment_session_status as enum ('waiting_for_game', 'completed_game', 'post_completed', 'expired');
exception
  when duplicate_object then null;
end
$$;

-- 2. assessment_sessions -------------------------------------------------------
-- One row per Game Code. Scores live in `assessment_results` (linked through
-- pre_result_id / post_result_id) so the existing per-category analytics keep
-- working unchanged; the game metrics live in `game_results`.
create table if not exists public.assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  game_code text not null unique check (game_code ~ '^[A-Z0-9]{6}$'),
  -- Only modules that have a Unity scenario ('General' has none).
  module text not null check (module in ('Earthquake', 'Typhoon', 'Landslide', 'Tsunami', 'Volcanic Eruption')),
  status public.assessment_session_status not null default 'waiting_for_game',
  identifier text not null check (char_length(btrim(identifier)) between 1 and 200),  -- student ID / email / name typed on the web
  guest_id text check (guest_id is null or char_length(guest_id) between 1 and 100),  -- Unity `localGuestId`, attached on upload
  pre_result_id uuid references public.assessment_results(id) on delete set null,
  post_result_id uuid references public.assessment_results(id) on delete set null,
  created_at timestamptz not null default now(),
  expired_at timestamptz not null default (now() + interval '2 days'),
  pre_completed_at timestamptz,
  game_started_at timestamptz,    -- first time the code was validated in Unity
  game_completed_at timestamptz,  -- when the evaluation was uploaded
  post_completed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint assessment_sessions_expiry_after_creation check (expired_at > created_at)
);

create index if not exists assessment_sessions_status_idx on public.assessment_sessions (status);
create index if not exists assessment_sessions_module_idx on public.assessment_sessions (module);
create index if not exists assessment_sessions_created_at_idx on public.assessment_sessions (created_at desc);
create index if not exists assessment_sessions_guest_id_idx on public.assessment_sessions (guest_id);

create or replace function public.set_assessment_session_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists assessment_sessions_set_updated_at on public.assessment_sessions;
create trigger assessment_sessions_set_updated_at
  before update on public.assessment_sessions
  for each row
  execute function public.set_assessment_session_updated_at();

-- 3. game_results --------------------------------------------------------------
-- The Unity evaluation: one row per session. `score_details` keeps the raw
-- payload so metrics the game adds later are not lost.
create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.assessment_sessions(id) on delete cascade,
  guest_id text not null,
  module text not null,
  game_score integer not null default 0 check (game_score >= 0),
  completion_time_seconds integer not null default 0 check (completion_time_seconds >= 0),
  hazards_avoided integer not null default 0 check (hazards_avoided >= 0),
  hazards_total integer not null default 0 check (hazards_total >= 0),
  checklist_completed integer not null default 0 check (checklist_completed >= 0),
  checklist_total integer not null default 0 check (checklist_total >= 0),
  score_details jsonb not null default '{}'::jsonb,
  client_completed_at timestamptz,               -- device clock when the scenario ended (may be offline)
  uploaded_at timestamptz not null default now()
);

create index if not exists game_results_guest_id_idx on public.game_results (guest_id);

-- 4. Link web assessment results back to their session -------------------------
alter table public.assessment_results
  add column if not exists session_id uuid references public.assessment_sessions(id) on delete set null;

create index if not exists assessment_results_session_idx on public.assessment_results (session_id);

-- 5. Helpers --------------------------------------------------------------------
create or replace function public.generate_game_code()
returns text
language plpgsql
volatile
set search_path = public, extensions
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- 32 chars: 256 % 32 = 0, so every byte maps uniformly
  bytes bytea;
  code text;
  attempts integer := 0;
begin
  loop
    bytes := gen_random_bytes(6);
    code := '';
    for i in 0..5 loop
      code := code || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.assessment_sessions where game_code = code);
    attempts := attempts + 1;
    if attempts > 20 then
      raise exception 'could not generate a unique game code';
    end if;
  end loop;
  return code;
end;
$$;

-- 'expired' is derived, not stored (see the lifecycle note at the top).
create or replace function public.effective_session_status(
  p_status public.assessment_session_status,
  p_expired_at timestamptz,
  p_game_started_at timestamptz
)
returns text
language sql
stable
as $$
  select case
    when p_status = 'waiting_for_game' and p_expired_at < now() and p_game_started_at is null then 'expired'
    else p_status::text
  end;
$$;

-- 6. Web RPCs -------------------------------------------------------------------

-- Saves the Pre-Test and creates the session in ONE transaction, so a code is
-- never issued without a stored Pre-Test. Returns the new Game Code.
create or replace function public.submit_pre_test(
  p_module text,
  p_identifier text,
  p_score integer,
  p_total integer,
  p_answers jsonb default '[]'::jsonb,
  p_likert integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_identifier text := btrim(p_identifier);
  v_session_id uuid;
  v_code text;
  v_expires timestamptz;
  v_result_id uuid;
begin
  if p_module is null or p_module <> all (array['Earthquake', 'Typhoon', 'Landslide', 'Tsunami', 'Volcanic Eruption'])
     or v_identifier is null or char_length(v_identifier) not between 1 and 200
     or p_total is null or p_total <= 0
     or p_score is null or p_score < 0 or p_score > p_total
     or (p_likert is not null and p_likert not between 1 and 5)
  then
    return jsonb_build_object('ok', false, 'error', 'invalid_input');
  end if;

  insert into public.assessment_sessions (game_code, module, identifier)
  values (public.generate_game_code(), p_module, v_identifier)
  returning id, game_code, expired_at into v_session_id, v_code, v_expires;

  insert into public.assessment_results
    (identifier, assessment_type, disaster_module, score, total_questions, answers_payload, likert_preparedness_rating, session_id)
  values
    (v_identifier, 'pre-assessment', p_module, p_score, p_total, coalesce(p_answers, '[]'::jsonb), p_likert, v_session_id)
  returning id into v_result_id;

  update public.assessment_sessions
     set pre_result_id = v_result_id, pre_completed_at = now()
   where id = v_session_id;

  return jsonb_build_object('ok', true, 'game_code', v_code, 'expires_at', v_expires);
end;
$$;

-- Everything the web needs about one session. Used to resume with a code, to
-- poll for `completed_game`, and to build the final report. Deliberately
-- omits the participant identifier and guest id.
create or replace function public.get_session(p_game_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  s public.assessment_sessions;
  pre_r public.assessment_results;
  post_r public.assessment_results;
  g public.game_results;
begin
  select * into s from public.assessment_sessions where game_code = upper(btrim(p_game_code));
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;

  select * into pre_r from public.assessment_results where id = s.pre_result_id;
  select * into post_r from public.assessment_results where id = s.post_result_id;
  select * into g from public.game_results where session_id = s.id;

  return jsonb_build_object(
    'ok', true,
    'game_code', s.game_code,
    'module', s.module,
    'status', public.effective_session_status(s.status, s.expired_at, s.game_started_at),
    'created_at', s.created_at,
    'expires_at', s.expired_at,
    'pre_completed_at', s.pre_completed_at,
    'game_started_at', s.game_started_at,
    'game_completed_at', s.game_completed_at,
    'post_completed_at', s.post_completed_at,
    'pre', case when pre_r.id is null then null else jsonb_build_object(
      'score', pre_r.score, 'total', pre_r.total_questions, 'confidence', pre_r.likert_preparedness_rating) end,
    'post', case when post_r.id is null then null else jsonb_build_object(
      'score', post_r.score, 'total', post_r.total_questions, 'confidence', post_r.likert_preparedness_rating) end,
    'game', case when g.id is null then null else jsonb_build_object(
      'game_score', g.game_score,
      'completion_time_seconds', g.completion_time_seconds,
      'hazards_avoided', g.hazards_avoided,
      'hazards_total', g.hazards_total,
      'checklist_completed', g.checklist_completed,
      'checklist_total', g.checklist_total,
      'uploaded_at', g.uploaded_at) end
  );
end;
$$;

-- Saves the Post-Test. The row is locked so two tabs cannot both submit, and
-- the Post-Test is refused until the game evaluation has been uploaded.
create or replace function public.submit_post_test(
  p_game_code text,
  p_score integer,
  p_total integer,
  p_answers jsonb default '[]'::jsonb,
  p_likert integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.assessment_sessions;
  v_result_id uuid;
begin
  select * into s from public.assessment_sessions where game_code = upper(btrim(p_game_code)) for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;

  if s.post_result_id is not null then
    return jsonb_build_object('ok', false, 'error', 'already_submitted');
  end if;
  if s.status <> 'completed_game' then
    return jsonb_build_object('ok', false, 'error', 'game_not_completed');
  end if;

  if p_total is null or p_total <= 0
     or p_score is null or p_score < 0 or p_score > p_total
     or (p_likert is not null and p_likert not between 1 and 5)
  then
    return jsonb_build_object('ok', false, 'error', 'invalid_input');
  end if;

  insert into public.assessment_results
    (identifier, assessment_type, disaster_module, score, total_questions, answers_payload, likert_preparedness_rating, session_id)
  values
    (s.identifier, 'post-assessment', s.module, p_score, p_total, coalesce(p_answers, '[]'::jsonb), p_likert, s.id)
  returning id into v_result_id;

  update public.assessment_sessions
     set status = 'post_completed', post_result_id = v_result_id, post_completed_at = now()
   where id = s.id;

  return jsonb_build_object('ok', true);
end;
$$;

-- 7. Unity RPCs -----------------------------------------------------------------

-- "Is this code playable?" A valid code must be waiting_for_game and not
-- expired. Stamps `game_started_at` the first time, which is what later lets
-- an offline player upload after the code's 2-day window has passed.
create or replace function public.validate_game_code(p_game_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.assessment_sessions;
begin
  select * into s from public.assessment_sessions where game_code = upper(btrim(p_game_code)) for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;
  if s.status <> 'waiting_for_game' then
    return jsonb_build_object('ok', false, 'error', 'already_played');
  end if;
  if s.expired_at < now() then
    return jsonb_build_object('ok', false, 'error', 'expired');
  end if;

  update public.assessment_sessions
     set game_started_at = coalesce(game_started_at, now())
   where id = s.id;

  return jsonb_build_object('ok', true, 'game_code', s.game_code, 'module', s.module, 'expires_at', s.expired_at);
end;
$$;

-- Uploads the Unity evaluation and flips the session to completed_game.
-- Idempotent: a retry from the same guest after a dropped response returns
-- ok + already_uploaded instead of an error, so Unity can safely re-send.
--
-- p_score_details keys (camelCase, as serialized by the Unity script):
--   gameScore, completionTimeSeconds, hazardsAvoided, hazardsTotal,
--   checklistCompleted, checklistTotal
create or replace function public.submit_game_result(
  p_game_code text,
  p_guest_id text,
  p_module text,
  p_score_details jsonb,
  p_client_completed_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.assessment_sessions;
  v_guest text := btrim(p_guest_id);
  v_game_score integer;
  v_time integer;
  v_haz_avoided integer;
  v_haz_total integer;
  v_check_done integer;
  v_check_total integer;
begin
  select * into s from public.assessment_sessions where game_code = upper(btrim(p_game_code)) for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;

  if v_guest is null or char_length(v_guest) not between 1 and 100
     or p_score_details is null or jsonb_typeof(p_score_details) <> 'object'
  then
    return jsonb_build_object('ok', false, 'error', 'invalid_input');
  end if;
  if p_module is distinct from s.module then
    return jsonb_build_object('ok', false, 'error', 'module_mismatch');
  end if;

  if public.effective_session_status(s.status, s.expired_at, s.game_started_at) = 'expired' then
    return jsonb_build_object('ok', false, 'error', 'expired');
  end if;

  if s.status <> 'waiting_for_game' then
    if exists (select 1 from public.game_results where session_id = s.id and guest_id = v_guest) then
      return jsonb_build_object('ok', true, 'already_uploaded', true);
    end if;
    return jsonb_build_object('ok', false, 'error', 'already_completed');
  end if;

  begin
    v_game_score  := greatest(coalesce((p_score_details ->> 'gameScore')::integer, 0), 0);
    v_time        := greatest(coalesce((p_score_details ->> 'completionTimeSeconds')::integer, 0), 0);
    v_haz_avoided := greatest(coalesce((p_score_details ->> 'hazardsAvoided')::integer, 0), 0);
    v_haz_total   := greatest(coalesce((p_score_details ->> 'hazardsTotal')::integer, 0), 0);
    v_check_done  := greatest(coalesce((p_score_details ->> 'checklistCompleted')::integer, 0), 0);
    v_check_total := greatest(coalesce((p_score_details ->> 'checklistTotal')::integer, 0), 0);
  exception
    when invalid_text_representation or numeric_value_out_of_range then
      return jsonb_build_object('ok', false, 'error', 'invalid_input');
  end;

  insert into public.game_results
    (session_id, guest_id, module, game_score, completion_time_seconds, hazards_avoided, hazards_total,
     checklist_completed, checklist_total, score_details, client_completed_at)
  values
    (s.id, v_guest, s.module, v_game_score, v_time, v_haz_avoided, v_haz_total,
     v_check_done, v_check_total, p_score_details, p_client_completed_at);

  update public.assessment_sessions
     set status = 'completed_game',
         guest_id = v_guest,
         game_started_at = coalesce(game_started_at, now()),
         game_completed_at = now()
   where id = s.id;

  return jsonb_build_object('ok', true);
end;
$$;

-- 8. Row Level Security ----------------------------------------------------------
alter table public.assessment_sessions enable row level security;
alter table public.game_results enable row level security;

-- No anon policies on purpose: anonymous access goes through the RPCs above.
drop policy if exists "Admins can read assessment sessions" on public.assessment_sessions;
create policy "Admins can read assessment sessions"
  on public.assessment_sessions for select to authenticated using (true);

drop policy if exists "Admins can delete assessment sessions" on public.assessment_sessions;
create policy "Admins can delete assessment sessions"
  on public.assessment_sessions for delete to authenticated using (true);

drop policy if exists "Admins can read game results" on public.game_results;
create policy "Admins can read game results"
  on public.game_results for select to authenticated using (true);

-- Belt and braces: even with RLS, don't leave table privileges on anon.
revoke all on public.assessment_sessions from anon;
revoke all on public.game_results from anon;

-- The Post-Test gate would be meaningless if anyone could still INSERT a
-- 'post-assessment' row straight into assessment_results. All web submissions
-- now go through submit_pre_test / submit_post_test, so drop the anonymous
-- insert policy that the old page used.
drop policy if exists "Public can submit assessment results" on public.assessment_results;

-- 9. Function privileges ---------------------------------------------------------
-- Postgres grants EXECUTE to PUBLIC by default; restrict to what is intended.
revoke all on function public.generate_game_code() from public, anon, authenticated;
revoke all on function public.submit_pre_test(text, text, integer, integer, jsonb, integer) from public;
revoke all on function public.get_session(text) from public;
revoke all on function public.submit_post_test(text, integer, integer, jsonb, integer) from public;
revoke all on function public.validate_game_code(text) from public;
revoke all on function public.submit_game_result(text, text, text, jsonb, timestamptz) from public;

grant execute on function public.submit_pre_test(text, text, integer, integer, jsonb, integer) to anon, authenticated;
grant execute on function public.get_session(text) to anon, authenticated;
grant execute on function public.submit_post_test(text, integer, integer, jsonb, integer) to anon, authenticated;
grant execute on function public.validate_game_code(text) to anon, authenticated;
grant execute on function public.submit_game_result(text, text, text, jsonb, timestamptz) to anon, authenticated;
grant execute on function public.effective_session_status(public.assessment_session_status, timestamptz, timestamptz) to anon, authenticated;

-- 10. Admin view: one flat row per session for the Guest Tracking tab ---------
-- security_invoker makes the view run with the CALLER's privileges, so the
-- admin-only RLS above applies (anon gets nothing). Needs Postgres 15+
-- (all current Supabase projects).
-- Knowledge gain is Post % minus Pre % (percentage points).
create or replace view public.admin_guest_sessions
with (security_invoker = true) as
select
  s.id,
  s.game_code,
  s.module,
  s.guest_id,
  s.identifier,
  public.effective_session_status(s.status, s.expired_at, s.game_started_at) as status,
  s.created_at,
  s.expired_at,
  s.pre_completed_at,
  s.game_started_at,
  s.game_completed_at,
  s.post_completed_at,
  pre.score as pre_score,
  pre.total_questions as pre_total,
  pre.likert_preparedness_rating as pre_confidence,
  post.score as post_score,
  post.total_questions as post_total,
  post.likert_preparedness_rating as post_confidence,
  g.game_score,
  g.completion_time_seconds,
  g.hazards_avoided,
  g.hazards_total,
  g.checklist_completed,
  g.checklist_total,
  case
    when pre.total_questions > 0 and post.total_questions > 0
    then round(100.0 * post.score / post.total_questions - 100.0 * pre.score / pre.total_questions)
  end as knowledge_gain
from public.assessment_sessions s
left join public.assessment_results pre on pre.id = s.pre_result_id
left join public.assessment_results post on post.id = s.post_result_id
left join public.game_results g on g.session_id = s.id;

revoke all on public.admin_guest_sessions from anon;
grant select on public.admin_guest_sessions to authenticated;

-- 11. Realtime for the admin tab (only if the publication exists) ---------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.assessment_sessions;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.game_results;
    exception when duplicate_object then null;
    end;
  end if;
end
$$;

notify pgrst, 'reload schema';
