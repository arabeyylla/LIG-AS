import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Admin-side Supabase query hook for the `assessment_results` table.
 * Fetches every row (RLS restricts SELECT to authenticated/admin sessions —
 * see supabase/migrations/20260916_create_assessment_results.sql) and keeps
 * them live via a Postgres changes subscription, matching the pattern used
 * by the Feedback and Analytics admin pages.
 *
 * Returns:
 *   rows        - all assessment_results rows, newest first
 *   loading     - true while the initial fetch is in flight
 *   error       - last fetch error message, if any
 *   refetch     - re-run the fetch manually
 *   removeLocal - optimistically drop a row from local state after a delete,
 *                 without waiting for the realtime event to arrive
 */
export function useAssessmentResults() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // This hook is used by both the result table and its analytics cards on
  // the same page. Each listener must have its own Realtime channel.
  const channelName = useRef(`admin-assessment-results-${Math.random().toString(36).slice(2)}`).current;

  const fetchRows = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('assessment_results')
        .select('*')
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setRows(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch assessment results:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
    if (!supabase) return;

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assessment_results' }, fetchRows)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchRows, channelName]);

  const removeLocal = useCallback((id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { rows, loading, error, refetch: fetchRows, removeLocal };
}
