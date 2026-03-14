// src/lib/logger.js
// Global logging utility: writes to system_logs table for admin visibility.

import { supabase } from './supabaseClient';

/**
 * Create a system log entry. Call from anywhere (auth, admin actions, simulations).
 * @param {string} message - Log message (e.g. "User logged in", "Admin approved user registration")
 * @param {string|null} [userIdentifier=null] - Optional identifier (email, user id, or "Target ID: xxx")
 */
export const createLog = async (message, userIdentifier = null) => {
  const { error } = await supabase.from('system_logs').insert([
    {
      message,
      user_identifier: userIdentifier,
    },
  ]);

  if (error) console.error('Logging failed:', error);
};
