import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase } from '../../lib/supabase';
import { BarChart3, Download, Eye, TrendingUp, Loader2, Globe, Clock } from 'lucide-react';

export default function Analytics() {
  const [pageVisits, setPageVisits] = useState([]); // [{ page_name, count }], grouped client-side
  const [totalVisits, setTotalVisits] = useState(0);
  const [downloads, setDownloads] = useState({ total: 0, last_download: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    if (!supabase) return;

    const channel = supabase
      .channel('admin-analytics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'page_visits' }, fetchAnalytics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'downloads' }, fetchAnalytics)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchAnalytics() {
    if (!supabase) { setLoading(false); return; }
    try {
      setLoading(true);

      // Total Page Visits: `page_visits` is an event log (one row per view —
      // see 20260917_page_visits_event_log.sql), so an exact row count over
      // the whole table IS the total. `head: true` skips returning the rows
      // themselves since only the count is needed here.
      const { count: totalCount } = await supabase
        .from('page_visits')
        .select('*', { count: 'exact', head: true });
      setTotalVisits(totalCount || 0);

      // Per-page breakdown: the Supabase query builder has no GROUP BY, so
      // fetch each visit's page_name and tally per page client-side.
      const { data: visitRows } = await supabase.from('page_visits').select('page_name');
      const grouped = {};
      (visitRows || []).forEach((r) => { grouped[r.page_name] = (grouped[r.page_name] || 0) + 1; });
      const breakdown = Object.entries(grouped)
        .map(([page_name, count]) => ({ page_name, count }))
        .sort((a, b) => b.count - a.count);
      setPageVisits(breakdown);

      // Fetch downloads. `.maybeSingle()` (not `.single()`) so a fresh
      // `downloads` table with zero rows returns null instead of a 406.
      const { data: dlData } = await supabase
        .from('downloads')
        .select('*')
        .maybeSingle();
      if (dlData) setDownloads(dlData);
    } catch (err) {
      console.error('Failed to fetch analytics:', err.message);
    } finally {
      setLoading(false);
    }
  }

  const maxVisits = pageVisits.length > 0 ? pageVisits[0].count : 1;

  const pageLabels = { home: 'Home', about: 'About', 'how-to-play': 'How to Play', team: 'Team', faq: 'FAQ', download: 'Download' };

  return (
    <AdminLayout>
      <div className="w-full">
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-slate-800 tracking-tighter">Analytics</h1>
          <p className="text-slate-400 font-bold mt-2">Track site traffic and game downloads.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 text-slate-400 gap-4"><Loader2 className="animate-spin" size={40} /><p className="font-bold">Loading analytics data...</p></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Eye size={24} /></div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Page Visits</p>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{totalVisits.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4"><Download size={24} /></div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Downloads</p>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{(downloads.total || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4"><Clock size={24} /></div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Last Download</p>
                <p className="text-lg font-black text-slate-800 tracking-tight">
                  {downloads.last_download ? new Date(downloads.last_download).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No downloads yet'}
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8"><BarChart3 className="text-blue-500" size={24} /><h3 className="font-black text-slate-800 text-lg">Page Visits Breakdown</h3></div>
                {pageVisits.length === 0 ? (
                  <div className="text-center py-10"><Globe className="text-slate-200 mx-auto mb-3" size={40} /><p className="text-slate-400 font-bold text-sm">No visit data yet.</p></div>
                ) : (
                  <div className="space-y-4">
                    {pageVisits.map((p) => (
                      <div key={p.page_name} className="flex items-center gap-4">
                        <span className="text-sm font-bold text-slate-600 w-28 flex-shrink-0">{pageLabels[p.page_name] || p.page_name}</span>
                        <div className="flex-1 h-8 bg-slate-50 rounded-lg overflow-hidden relative">
                          <div className="h-full bg-blue-500 rounded-lg transition-all duration-500" style={{ width: `${Math.max((p.count / maxVisits) * 100, 4)}%` }} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-600">{p.count.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8"><TrendingUp className="text-orange-500" size={24} /><h3 className="font-black text-slate-800 text-lg">Download Statistics</h3></div>
                <div className="space-y-6">
                  <div className="bg-orange-50 rounded-2xl p-8 text-center">
                    <Download className="text-orange-500 mx-auto mb-3" size={40} />
                    <p className="text-4xl font-black text-slate-800 mb-1">{(downloads.total || 0).toLocaleString()}</p>
                    <p className="text-sm font-bold text-slate-500">APK Downloads</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <span className="text-sm font-bold text-slate-600">Download Page Visits</span>
                      <span className="text-sm font-black text-slate-800">{(pageVisits.find(p => p.page_name === 'download')?.count || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <span className="text-sm font-bold text-slate-600">Conversion Rate</span>
                      <span className="text-sm font-black text-orange-600">
                        {(() => { const dlPageVisits = pageVisits.find(p => p.page_name === 'download')?.count; return dlPageVisits && downloads.total ? `${Math.round((downloads.total / dlPageVisits) * 100)}%` : '—'; })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center"><button onClick={fetchAnalytics} className="text-sm font-bold text-slate-400 hover:text-orange-500 transition-colors">Refresh data</button></div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
