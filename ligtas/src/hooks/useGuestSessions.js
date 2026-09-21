import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Admin-side query hook for Guest Player Tracking. Reads the
 * `admin_guest_sessions` view (supabase/migrations/20260922_game_code_sessions.sql),
 * which joins each Game Code session with its Pre-Test, mobile game result and
 * Post-Test, and derives the `expired` status. RLS limits it to signed-in
 * admin sessions. Stays live via Postgres change subscriptions on the two
 * underlying tables (a view cannot be subscribed to directly), following the
 * pattern of useAssessmentResults.
 *
 * Returns { rows, loading, error, refetch } — rows are newest first.
 */
export function useGuestSessions() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const channelName = useRef(`admin-guest-sessions-${Math.random().toString(36).slice(2)}`).current;

  const fetchRows = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    try {
      const { data, error: fetchError } = await supabase
        .from('admin_guest_sessions')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setRows(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch guest sessions:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
    if (!supabase) return undefined;

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assessment_sessions' }, fetchRows)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_results' }, fetchRows)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchRows, channelName]);

  return { rows, loading, error, refetch: fetchRows };
}
