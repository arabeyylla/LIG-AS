import { supabase } from './supabase';

/** Records a non-blocking audit event. Logging must never prevent the user action. */
export async function logSystemEvent(action, details = {}, entityType = null, entityId = null, actor = undefined) {
  if (!supabase) return false;

  try {
    let user = actor;
    if (user === undefined) {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }
    const { error } = await supabase.from('system_logs').insert({
      // message and user_identifier support the original table schema;
      // the remaining fields support the richer admin log viewer.
      message: action,
      user_identifier: user?.email ?? 'visitor',
      action,
      details,
      entity_type: entityType,
      entity_id: entityId ? String(entityId) : null,
      actor_id: user?.id ?? null,
      actor_email: user?.email ?? null,
    });
    if (error) {
      console.error('Failed to write system log:', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to write system log:', error.message);
    return false;
  }
}
