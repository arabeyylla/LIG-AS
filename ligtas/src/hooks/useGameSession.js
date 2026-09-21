import { useState, useEffect, useCallback } from 'react';
import { getSession, SESSION_STATUS } from '../lib/assessmentSessions';

const POLL_INTERVAL_MS = 5000;

/**
 * Loads one Game Code session (via the `get_session` RPC) and keeps it fresh
 * while the player is out playing the mobile game.
 *
 * While the status is `waiting_for_game` it re-checks every few seconds — and
 * immediately when the tab becomes visible again — so the Post-Test unlocks by
 * itself the moment the Unity app uploads the evaluation. Polling stops as soon
 * as the game is complete. (Supabase Realtime is not used here because the
 * anonymous browser has no read access to the sessions table; the RPC is the
 * only door.)
 *
 * Returns:
 *   session  - latest `get_session` payload, or null until the first success
 *   error    - error code from the last failed check ('invalid_code', 'network', ...) or null
 *   loading  - true until the first check finishes
 *   refresh  - re-check now
 */
export function useGameSession(gameCode) {
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyResult = useCallback((result) => {
    if (result.ok) {
      setSession(result);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    const result = await getSession(gameCode);
    applyResult(result);
    return result;
  }, [gameCode, applyResult]);

  // Initial load. Ignores the response if the code changed or the view unmounted meanwhile.
  useEffect(() => {
    let cancelled = false;
    getSession(gameCode).then((result) => {
      if (!cancelled) applyResult(result);
    });
    return () => { cancelled = true; };
  }, [gameCode, applyResult]);

  const isWaiting = session?.status === SESSION_STATUS.WAITING;

  useEffect(() => {
    if (!isWaiting) return undefined;
    const check = () => { if (!document.hidden) refresh(); };
    const timer = setInterval(check, POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, [isWaiting, refresh]);

  return { session, error, loading, refresh };
}
