-- Link the Unity Guest ID to the session as soon as the Game Code is entered.
--
-- Before: validate_game_code(p_game_code) never received the Guest ID, so
-- `assessment_sessions.guest_id` stayed NULL ("Not linked yet" in the admin)
-- until the scenario finished.
--
-- After: validate_game_code(p_game_code, p_guest_id) records the guest on every
-- successful validation. The code follows the LAST device that entered it, so a
-- participant can switch devices while the web session is still open. Once a
-- result has been uploaded the session is `completed_game` and the code can no
-- longer be entered (already_played); the first upload wins.
--
-- Run in the Supabase SQL editor. Ship the updated Unity script
-- (unity/LigasSessionSync.cs) at the same time: builds that still call the old
-- one-argument function will get an error until they are updated.

-- 1. Replace validate_game_code -------------------------------------------------
drop function if exists public.validate_game_code(text);

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
  if s.expired_at < now() and s.game_started_at is null then
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

-- 2. Game Codes now stay valid for 20 days (was 2) ------------------------------
-- Applies to sessions created from now on; existing rows keep their expired_at.
alter table public.assessment_sessions
  alter column expired_at set default (now() + interval '20 days');

-- 3. Extend codes that already exist to 20 days from creation -------------------
-- Only sessions still waiting for the game, so completed sessions keep their history.
-- This also revives waiting codes that had already timed out under the old 2-day rule.
update public.assessment_sessions
   set expired_at = created_at + interval '20 days'
 where status = 'waiting_for_game'
   and expired_at < created_at + interval '20 days';
