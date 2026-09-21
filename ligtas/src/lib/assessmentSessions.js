import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Web client for the Game Code session RPCs defined in
// supabase/migrations/20260922_game_code_sessions.sql.
//
// The browser never reads or writes `assessment_sessions` directly (anonymous
// users have no table access — the Game Code is the only credential). Every
// call goes through a SECURITY DEFINER function that returns
// `{ ok: true, ... }` or `{ ok: false, error }`. These wrappers keep that
// shape and turn transport failures into `{ ok: false, error: 'network' }`,
// so callers never need try/catch.
// ---------------------------------------------------------------------------

export const SESSION_STATUS = {
  WAITING: 'waiting_for_game',
  GAME_DONE: 'completed_game',
  POST_DONE: 'post_completed',
  EXPIRED: 'expired',
};

export const GAME_CODE_LENGTH = 6;

/** Uppercases and strips anything that cannot be in a code (spaces, dashes), capped at 6 chars. */
export function normalizeGameCode(raw) {
  return String(raw ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, GAME_CODE_LENGTH);
}

export function isCompleteGameCode(code) {
  return code.length === GAME_CODE_LENGTH;
}

async function callRpc(fn, args) {
  if (!supabase) return { ok: false, error: 'not_configured' };
  try {
    const { data, error } = await supabase.rpc(fn, args);
    if (error || !data) {
      console.error(`Supabase RPC ${fn} failed:`, error?.message ?? 'empty response');
      return { ok: false, error: 'network' };
    }
    return data;
  } catch (err) {
    console.error(`Supabase RPC ${fn} threw:`, err.message);
    return { ok: false, error: 'network' };
  }
}

/** Saves the Pre-Test and creates the session. Resolves `{ ok, game_code, expires_at }`. */
export function submitPreTest({ module, identifier, score, total, answers, likert }) {
  return callRpc('submit_pre_test', {
    p_module: module,
    p_identifier: identifier,
    p_score: score,
    p_total: total,
    p_answers: answers,
    p_likert: likert,
  });
}

/** Everything about one session: status, timeline, Pre / Game / Post results. */
export function getSession(gameCode) {
  return callRpc('get_session', { p_game_code: gameCode });
}

/** Saves the Post-Test. The database refuses it until the mobile game has been uploaded. */
export function submitPostTest({ gameCode, score, total, answers, likert }) {
  return callRpc('submit_post_test', {
    p_game_code: gameCode,
    p_score: score,
    p_total: total,
    p_answers: answers,
    p_likert: likert,
  });
}

const ERROR_MESSAGES = {
  invalid_code: "We couldn't find that Game Code. Check it and try again.",
  invalid_input: "Some of your answers couldn't be saved. Please review them and try again.",
  game_not_completed: 'The Post-Test unlocks after you finish the scenario in the LIG+AS mobile app.',
  already_submitted: 'The Post-Test for this Game Code has already been submitted.',
  not_configured: 'The backend is not configured.',
};

/** User-facing text for an `error` code returned by the RPCs above. */
export function sessionErrorMessage(error) {
  return ERROR_MESSAGES[error] ?? "We couldn't reach the server. Check your connection and try again.";
}
