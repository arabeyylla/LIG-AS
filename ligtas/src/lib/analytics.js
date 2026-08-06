// src/lib/analytics.js
// Utility functions for tracking page visits and downloads via Supabase
import { supabase } from './supabase';

/**
 * Track a page visit by upserting the counter for that page.
 * Uses Supabase RPC function: increment_page_visit(page TEXT)
 * Fallback: direct upsert to page_visits table
 */
export async function trackPageVisit(pageName) {
  if (!supabase) return;
  try {
    // Try RPC first (most efficient)
    const { error } = await supabase.rpc('increment_page_visit', { page: pageName });
    if (error) {
      // Fallback: try direct upsert
      const { data: existing } = await supabase
        .from('page_visits')
        .select('count')
        .eq('page_name', pageName)
        .single();

      if (existing) {
        await supabase
          .from('page_visits')
          .update({ count: existing.count + 1 })
          .eq('page_name', pageName);
      } else {
        await supabase
          .from('page_visits')
          .insert({ page_name: pageName, count: 1 });
      }
    }
  } catch (err) {
    console.error('Failed to track page visit:', err.message);
  }
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
      // Fallback: direct update
      const { data: existing } = await supabase
        .from('downloads')
        .select('total')
        .eq('id', 1)
        .single();

      if (existing) {
        await supabase
          .from('downloads')
          .update({ total: existing.total + 1, last_download: new Date().toISOString() })
          .eq('id', 1);
      } else {
        await supabase
          .from('downloads')
          .insert({ id: 1, total: 1, last_download: new Date().toISOString() });
      }
    }
  } catch (err) {
    console.error('Failed to track download:', err.message);
  }
}
