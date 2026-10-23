-- Game Codes now expire strictly at `expired_at`.
--
-- Before: a code only counted as expired if NO device had ever entered it
-- (`game_started_at is null`). Entering a code once in the app — even if the
-- scenario was never finished — kept it valid forever: validate_game_code
-- accepted it again weeks later, get_session reported `waiting_for_game`, and
-- the admin Guest Sessions tab never showed it as Expired.
--
-- After: any session still `waiting_for_game` once `expired_at` has passed is
-- expired, full stop. It is refused by validate_game_code (the Unity app shows
-- "This Game Code has expired..."), by submit_game_result (so a result that is
-- uploaded late is rejected too), and get_session / admin_guest_sessions report
-- it as `expired`. Sessions whose game was already uploaded (`completed_game`,
-- `post_completed`) are unaffected: the participant played in time, so the
-- Post-Test and final results stay available.
--
-- Trade-off: a player who validates a code just before it expires and then
-- finishes OFFLINE after it expires can no longer upload. Codes are valid for
-- 20 days, so this only affects a code entered at the very end of its window.
--
-- Run in the Supabase SQL editor after 20260923_bind_game_code_to_guest.sql.

-- 1. Derived status ---------------------------------------------------------------
-- Same signature as before (admin_guest_sessions and the RPCs depend on it), so
-- `create or replace` swaps the rule everywhere at once. `p_game_started_at`
-- is no longer used but stays in the signature for compatibility.
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
    when p_status = 'waiting_for_game' and p_expired_at <= now() then 'expired'
    else p_status::text
  end;
$$;

-- 2. Unity code check ---------------------------------------------------------------
create or replace function public.validate_game_code(p_game_code text, p_guest_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.assessment_sessions;
  v_guest text := btrim(p_guest_id);
begin
  if v_guest is null or char_length(v_guest) not between 1 and 100 then
    return jsonb_build_object('ok', false, 'error', 'invalid_input');
  end if;

  select * into s from public.assessment_sessions where game_code = upper(btrim(p_game_code)) for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;
  if s.status <> 'waiting_for_game' then
    return jsonb_build_object('ok', false, 'error', 'already_played');
  end if;
  -- Strict: no exception for codes that were entered before.
  if s.expired_at <= now() then
    return jsonb_build_object('ok', false, 'error', 'expired');
  end if;

  update public.assessment_sessions
     set guest_id = v_guest,
         game_started_at = coalesce(game_started_at, now())
   where id = s.id;

  return jsonb_build_object('ok', true, 'game_code', s.game_code, 'module', s.module, 'expires_at', s.expired_at);
end;
$$;

revoke all on function public.validate_game_code(text, text) from public;
grant execute on function public.validate_game_code(text, text) to anon, authenticated;

-- submit_game_result needs no change: it already refuses uploads when
-- effective_session_status(...) = 'expired', which now uses the strict rule.

notify pgrst, 'reload schema';
