import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase } from '../../lib/supabase';
import { ClipboardList, Loader2, RefreshCw } from 'lucide-react';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchLogs() {
    if (!supabase) { setLoading(false); return; }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_logs')
        .select('id, action, entity_type, entity_id, details, actor_email, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setLogs(data || []);
      setError(null);
    } catch (error) {
      console.error('Failed to load system logs:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
    if (!supabase) return;
    const channel = supabase
      .channel('admin-system-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, fetchLogs)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tighter">System Logs</h1>
            <p className="text-slate-400 font-bold mt-2">Latest 100 system and admin events. Updates live.</p>
          </div>
          <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:border-orange-400 hover:text-orange-500"><RefreshCw size={16} /> Refresh</button>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-red-700"><p className="font-black">System logs could not be loaded.</p><p className="text-sm mt-2">{error}</p></div>
        ) : loading ? (
          <div className="flex flex-col items-center py-20 gap-4 text-slate-400"><Loader2 className="animate-spin" size={36} /><span className="font-bold">Loading logs...</span></div>
        ) : logs.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl py-20 text-center"><ClipboardList className="mx-auto text-slate-300 mb-4" size={42} /><p className="font-bold text-slate-500">No log entries yet.</p></div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            {logs.map((log) => (
              <div key={log.id} className="p-5 border-b border-slate-100 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-slate-800">{log.action || 'System event'}</p>
                  <time className="text-xs font-bold text-slate-400">{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</time>
                </div>
                <p className="text-sm text-slate-500 mt-1">{log.actor_email || 'Visitor'}{log.entity_type ? ` • ${log.entity_type}${log.entity_id ? ` #${log.entity_id}` : ''}` : ''}</p>
                {log.details && Object.keys(log.details).length > 0 && <pre className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
