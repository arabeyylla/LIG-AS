import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Reads (and optionally writes) a single key from `site_settings` — the
 * small admin-editable config store used to control how many recent
 * Announcements/Gallery items appear on the public Landing page. See
 * supabase/migrations/20260918_site_settings_and_visibility.sql.
 *
 * Falls back to `defaultValue` if Supabase isn't configured, the row
 * doesn't exist yet, or the fetch fails — so pages never crash or show
 * nothing just because a setting hasn't been created yet.
 *
 * Public pages (e.g. Landing.jsx) only need `value`/`loading`. Admin pages
 * also call `save(nextValue)` to update it.
 */
export function useSiteSetting(key, defaultValue) {
  const [value, setValueState] = useState(defaultValue);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) { setLoading(false); return; }

    supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data?.value !== undefined && data?.value !== null) {
          setValueState(data.value);
        }
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [key]);

  const save = useCallback(async (nextValue) => {
    if (!supabase) return { error: new Error('Backend not configured.') };
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value: nextValue, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw error;
      setValueState(nextValue);
      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setSaving(false);
    }
  }, [key]);

  return { value, save, loading, saving };
}
