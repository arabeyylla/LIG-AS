import { useEffect, useState, useCallback, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminFilterBar from '../../components/admin/AdminFilterBar';
import { supabase } from '../../lib/supabase';
import { ClipboardList, Loader2, RefreshCw } from 'lucide-react';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Unified filter bar state (date range + limit). No visibility concept
  // for logs, so AdminFilterBar is used without its visibility control.
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [limit, setLimit] = useState(100);

  const fetchLogs = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_logs')
        .select('id, action, entity_type, entity_id, details, actor_email, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      setLogs(data || []);
      setError(null);
    } catch (error) {
      console.error('Failed to load system logs:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLogs();
    if (!supabase) return;
    const channel = supabase
      .channel('admin-system-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, fetchLogs)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchLogs]);

  // Date range narrows the already-fetched (server-limited) batch — for
  // this scale of admin log volume that's simple and matches how the other
  // admin pages filter client-side, at the cost of a range that could miss
  // older rows outside the current `limit` window.
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (startDate && new Date(log.created_at) < new Date(startDate)) return false;
      if (endDate && new Date(log.created_at) > new Date(`${endDate}T23:59:59`)) return false;
      return true;
    });
  }, [logs, startDate, endDate]);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tighter">System Logs</h1>
            <p className="text-slate-400 font-bold mt-2">Latest {limit} system and admin events. Updates live.</p>
          </div>
          <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:border-orange-400 hover:text-orange-500"><RefreshCw size={16} /> Refresh</button>
        </div>

        <AdminFilterBar
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          limit={limit}
          onLimitChange={setLimit}
        />

        {error ? (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-red-700"><p className="font-black">System logs could not be loaded.</p><p className="text-sm mt-2">{error}</p></div>
        ) : loading ? (
          <div className="flex flex-col items-center py-20 gap-4 text-slate-400"><Loader2 className="animate-spin" size={36} /><span className="font-bold">Loading logs...</span></div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl py-20 text-center">
            <ClipboardList className="mx-auto text-slate-300 mb-4" size={42} />
            <p className="font-bold text-slate-500">{logs.length === 0 ? 'No log entries yet.' : 'No log entries match your date range.'}</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            {filteredLogs.map((log) => (
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
