// src/lib/analytics.js
// Utility functions for tracking page visits and downloads via Supabase
import { supabase } from './supabase';
import { logSystemEvent } from './systemLogs';

/**
 * Track a page visit by inserting one event row into `page_visits`.
 * `page_visits` is an event log (one row per view), not a per-page counter —
 * see supabase/migrations/20260917_page_visits_event_log.sql — so this is a
 * plain insert with no RPC/upsert dance needed; the admin panel counts rows
 * (optionally grouped by page_name) to get totals and per-page breakdowns.
 */
export async function trackPageVisit(pageName) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('page_visits').insert({ page_name: pageName });
    if (error) throw error;
  } catch (err) {
    console.error('Failed to track page visit:', err.message);
  }
  logSystemEvent('page.viewed', { page: pageName }, 'page', pageName);
}

/**
 * Track a download event.
 * Uses Supabase RPC function: increment_download()
 * Fallback: direct upsert to downloads table
 */
export async function trackDownload() {
  if (!supabase) return;
  try {
    const { error } = await supabase.rpc('increment_download');
    if (error) {
      // Fallback: direct update. `.maybeSingle()` (not `.single()`) so a
      // fresh downloads table with no row yet returns null instead of
      // throwing a 406.
      const { data: existing } = await supabase
        .from('downloads')
        .select('total')
        .eq('id', 1)
        .maybeSingle();

      if (existing) {
        const { error: updateError } = await supabase
          .from('downloads')
          .update({ total: existing.total + 1, last_download: new Date().toISOString() })
          .eq('id', 1);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('downloads')
          .insert({ id: 1, total: 1, last_download: new Date().toISOString() });
        if (insertError) throw insertError;
      }
    }
  } catch (err) {
    console.error('Failed to track download:', err.message);
  }
  logSystemEvent('download.requested', {}, 'download');
}
