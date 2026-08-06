import { useState, useEffect } from 'react';
import { Download, Eye, MessageSquare, Megaphone, Activity, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/layout/AdminLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ downloads: 0, pageVisits: 0, feedbackCount: 0, announcementCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    if (!supabase) { setLoading(false); return; }
    try {
      setLoading(true);

      let downloads = 0;
      try {
        const { data } = await supabase.from('downloads').select('total').limit(1).single();
        if (data) downloads = data.total || 0;
      } catch (e) {}

      let pageVisits = 0;
      try {
        const { data } = await supabase.from('page_visits').select('count');
        if (data) pageVisits = data.reduce((sum, r) => sum + (r.count || 0), 0);
      } catch (e) {}

      let feedbackCount = 0;
      try {
        const { count } = await supabase.from('feedback').select('*', { count: 'exact', head: true });
        feedbackCount = count || 0;
      } catch (e) {}

      let announcementCount = 0;
      try {
        const { count } = await supabase.from('announcements').select('*', { count: 'exact', head: true });
        announcementCount = count || 0;
      } catch (e) {}

      setStats({ downloads, pageVisits, feedbackCount, announcementCount });
    } catch (err) {
      console.error('Stats fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="w-full">
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-slate-800 tracking-tighter">Dashboard Overview</h1>
          <p className="text-slate-400 text-lg font-bold mt-2">Welcome back. Here's what's happening with LIG+AS.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mb-8 lg:mb-10">
          <StatCard icon={<Download size={24} />} label="Total Downloads" value={stats.downloads} color="orange" loading={loading} />
          <StatCard icon={<Eye size={24} />} label="Page Visits" value={stats.pageVisits} color="blue" loading={loading} />
          <StatCard icon={<MessageSquare size={24} />} label="Feedback Messages" value={stats.feedbackCount} color="teal" loading={loading} />
          <StatCard icon={<Megaphone size={24} />} label="Announcements" value={stats.announcementCount} color="purple" loading={loading} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6"><Activity className="text-orange-500" size={24} /><h3 className="font-black text-slate-800 text-lg">Quick Actions</h3></div>
            <div className="space-y-3">
              <QuickAction label="Post a new announcement" link="/admin/announcements" />
              <QuickAction label="Check feedback inbox" link="/admin/feedback" />
              <QuickAction label="Manage game gallery" link="/admin/gallery" />
              <QuickAction label="View detailed analytics" link="/admin/analytics" />
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6"><TrendingUp className="text-teal-500" size={24} /><h3 className="font-black text-slate-800 text-lg">System Status</h3></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <span className="text-sm font-bold text-slate-600">Supabase Connection</span>
                <span className="flex items-center gap-2 text-sm font-bold text-green-600">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                  {supabase ? 'Connected' : 'Not Configured'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <span className="text-sm font-bold text-slate-600">Website Status</span>
                <span className="flex items-center gap-2 text-sm font-bold text-green-600">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>Online
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <span className="text-sm font-bold text-slate-600">Admin Role</span>
                <span className="text-sm font-bold text-slate-800">System Administrator</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon, label, value, color, loading }) {
  const styles = {
    orange: { icon: 'bg-orange-100 text-orange-600' },
    blue: { icon: 'bg-blue-100 text-blue-600' },
    teal: { icon: 'bg-teal-100 text-teal-600' },
    purple: { icon: 'bg-purple-100 text-purple-600' },
  }[color] || { icon: 'bg-orange-100 text-orange-600' };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 lg:p-8 shadow-sm">
      <div className={`w-12 h-12 lg:w-14 lg:h-14 ${styles.icon} rounded-xl flex items-center justify-center mb-4`}>{icon}</div>
      <p className="text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      {loading ? <Loader2 className="animate-spin text-slate-300 mt-2" size={24} /> : <p className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tighter">{value.toLocaleString()}</p>}
    </div>
  );
}

function QuickAction({ label, link }) {
  return (
    <a href={link} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-orange-50 rounded-xl transition-colors group">
      <span className="text-sm font-bold text-slate-600 group-hover:text-orange-600 transition-colors">{label}</span>
      <span className="text-slate-300 group-hover:text-orange-500 transition-colors">&rarr;</span>
    </a>
  );
}
