import { supabase } from './supabase';

/** Records a non-blocking audit event. Logging must never prevent the user action. */
export async function logSystemEvent(action, details = {}, entityType = null, entityId = null) {
  if (!supabase) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('system_logs').insert({
      action,
      details,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      actor_id: user?.id ?? null,
      actor_email: user?.email ?? null,
    });
    if (error) console.error('Failed to write system log:', error.message);
  } catch (error) {
    console.error('Failed to write system log:', error.message);
  }
}
