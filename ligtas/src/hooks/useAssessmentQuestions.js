import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Admin-side Supabase query hook for the `assessment_questions` table (the
 * "Question Bank" sub-tab on the Assessment Results admin page). Fetches
 * every question — active and inactive — and keeps them live via a
 * Postgres changes subscription, matching the pattern used by
 * useAssessmentResults.
 */
export function useAssessmentQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuestions = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('assessment_questions')
        .select('*')
        .order('assessment_type', { ascending: true })
        .order('module', { ascending: true })
        .order('created_at', { ascending: true });
      if (fetchError) throw fetchError;
      setQuestions(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch assessment questions:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
    if (!supabase) return;

    const channel = supabase
      .channel('admin-assessment-questions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assessment_questions' }, fetchQuestions)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchQuestions]);

  const removeLocal = useCallback((id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  return { questions, loading, error, refetch: fetchQuestions, removeLocal };
}
