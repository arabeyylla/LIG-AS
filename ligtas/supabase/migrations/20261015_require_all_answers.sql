-- The database now refuses a Pre-Test or Post-Test with unanswered questions.
--
-- The web form already blocks this, but the RPCs trusted whatever the browser
-- sent: a modified or outdated client could submit `p_total = 10` with only
-- some answers. Now `p_answers` must be an array with exactly `p_total` items,
-- and every item must have a numeric `selectedIndex` (the shape built by
-- src/components/assessment/AssessmentQuiz.jsx). Otherwise the RPC returns
-- `{ ok: false, error: 'incomplete_answers' }` and nothing is saved.
--
-- Run in the Supabase SQL editor after 20261015_strict_game_code_expiry.sql.

-- 1. Helper -------------------------------------------------------------------------
create or replace function public.answers_complete(p_answers jsonb, p_total integer)
returns boolean
language sql
immutable
as $$
  select coalesce(
    jsonb_typeof(p_answers) = 'array'
    and jsonb_array_length(p_answers) = p_total
    and not exists (
      select 1
        from jsonb_array_elements(p_answers) as a(item)
       where jsonb_typeof(a.item -> 'selectedIndex') is distinct from 'number'
    ),
    false
  );
$$;

grant execute on function public.answers_complete(jsonb, integer) to anon, authenticated;

-- 2. Pre-Test (body unchanged apart from the answers check) --------------------------
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
  if not public.answers_complete(p_answers, p_total) then
    return jsonb_build_object('ok', false, 'error', 'incomplete_answers');
  end if;

  insert into public.assessment_sessions (game_code, module, identifier)
  values (public.generate_game_code(), p_module, v_identifier)
  returning id, game_code, expired_at into v_session_id, v_code, v_expires;

  insert into public.assessment_results
    (identifier, assessment_type, disaster_module, score, total_questions, answers_payload, likert_preparedness_rating, session_id)
  values
    (v_identifier, 'pre-assessment', p_module, p_score, p_total, p_answers, p_likert, v_session_id)
  returning id into v_result_id;

  update public.assessment_sessions
     set pre_result_id = v_result_id, pre_completed_at = now()
   where id = v_session_id;

  return jsonb_build_object('ok', true, 'game_code', v_code, 'expires_at', v_expires);
end;
$$;

-- 3. Post-Test (body unchanged apart from the answers check) -------------------------
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
  if not public.answers_complete(p_answers, p_total) then
    return jsonb_build_object('ok', false, 'error', 'incomplete_answers');
  end if;

  insert into public.assessment_results
    (identifier, assessment_type, disaster_module, score, total_questions, answers_payload, likert_preparedness_rating, session_id)
  values
    (s.identifier, 'post-assessment', s.module, p_score, p_total, p_answers, p_likert, s.id)
  returning id into v_result_id;

  update public.assessment_sessions
     set status = 'post_completed', post_result_id = v_result_id, post_completed_at = now()
   where id = s.id;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.submit_pre_test(text, text, integer, integer, jsonb, integer) from public;
revoke all on function public.submit_post_test(text, integer, integer, jsonb, integer) from public;
grant execute on function public.submit_pre_test(text, text, integer, integer, jsonb, integer) to anon, authenticated;
grant execute on function public.submit_post_test(text, integer, integer, jsonb, integer) to anon, authenticated;

notify pgrst, 'reload schema';
