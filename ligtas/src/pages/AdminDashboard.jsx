import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Activity, Settings, 
  Download, MessageSquare, Check, X, 
  Eye, MoreVertical, Search, Power,
  FileText, Clock, AlertTriangle, Send, 
  UserPlus, ShieldAlert, Loader2, Copy
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { createLog } from '../lib/logger';

export default function AdminDashboard() {
  const [showLogs, setShowLogs] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [posting, setPosting] = useState(false);

  // Real-time Data States
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Stats from DB (Server Status, Total Users, Active Now)
  const [statsLoading, setStatsLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState('checking');
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeNow, setActiveNow] = useState(null); // null = column not available

  // View ID modal
  const [viewIdUser, setViewIdUser] = useState(null);

  // Confirm Approve/Deny modal: { type: 'approve' | 'deny', id, name }
  const [confirmAction, setConfirmAction] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch real stats from database
  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        setStatsLoading(true);
        setServerStatus('checking');

        const { count: totalCount, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (!mounted) return;
        if (countError) throw countError;

        setTotalUsers(totalCount ?? 0);
        setServerStatus('online');

        // Active now: users with last_sign_in_at in last 15 minutes (if column exists)
        try {
          const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
          const { data: activeData, error: activeError } = await supabase
            .from('profiles')
            .select('id')
            .not('last_sign_in_at', 'is', null)
            .gte('last_sign_in_at', fifteenMinAgo);

          if (!mounted) return;
          if (!activeError) setActiveNow(activeData?.length ?? 0);
          else setActiveNow(null); // column may not exist
        } catch {
          setActiveNow(null);
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Stats fetch failed:", err.message);
        setServerStatus('offline');
        setTotalUsers(0);
        setActiveNow(null);
      } finally {
        if (mounted) setStatsLoading(false);
      }
    }

    fetchStats();
    return () => { mounted = false; };
  }, []);

  async function handlePostAnnouncement() {
    if (!announcementText.trim()) return;
    try {
      setPosting(true);

      // Get current admin info (optional but useful to store)
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('announcements')
        .insert({
          title: 'System Advisory',           // you can later expose a title input
          body: announcementText.trim(),
          category: 'System',                 // Advisory | System | Alert etc.
          created_by: user?.id || null
        });

      if (error) throw error;

      const preview = announcementText.trim().substring(0, 20);
      createLog(`Admin posted a new announcement: ${preview}${announcementText.trim().length > 20 ? '...' : ''}`, user?.email ?? null);

      setAnnouncementText("");
      alert("Announcement posted successfully. It will now show as the latest on the landing page.");
    } catch (err) {
      console.error("Failed to post announcement:", err.message);
      alert("Failed to post announcement: " + err.message);
    } finally {
      setPosting(false);
    }
  }

  async function fetchUsers() {
    try {
      setLoading(true);
      console.log("Admin: Starting fetch from 'profiles' table...");

      // Get current session to verify YOU are logged in
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current Admin UUID:", session?.user?.id);

      const { data, error, status, statusText } = await supabase
        .from('profiles') 
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase Error Object:", error);
        throw error;
      }

      console.log("Supabase Response Code:", status, statusText);
      console.log("Raw Data Received:", data);

      if (data.length === 0) {
        console.warn("Table is connected, but returned 0 rows. Check if RLS is blocking data or if table is empty.");
      }

      setUsers(data || []);
    } catch (err) {
      console.error("Dashboard Fetch Failed:", err.message);
      setUsers([]); 
    } finally {
      setLoading(false);
    }
  }

  // Filter Logic
  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'pending') return user.status === 'Pending Review';
    if (filter === 'denied') return user.status === 'Denied';
    return true;
  });

  return (
    <div className="max-w-[1800px] mx-auto py-4 px-6 lg:px-0">
      
      {/* HEADER SECTION */}
      <div className="mb-10">
        <h1 className="text-5xl font-black text-slate-800 tracking-tighter">System Control Panel</h1>
        <p className="text-slate-400 text-xl font-bold mt-2">Manage users, content, and view system health.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        
        {/* LEFT & CENTER: Management Suites */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* SYSTEM STATS OVERVIEW - real data from DB */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              label="Server Status"
              value={serverStatus === 'online' ? 'Online' : serverStatus === 'offline' ? 'Offline' : 'Checking…'}
              subValue={serverStatus === 'online' ? 'Connected to database' : serverStatus === 'offline' ? 'Cannot reach database' : '…'}
              status={serverStatus === 'online' ? 'online' : undefined}
              loading={statsLoading}
            />
            <StatCard
              label="Total Users"
              value={statsLoading ? '—' : totalUsers.toLocaleString()}
              subValue={statsLoading ? '…' : `From profiles table`}
              trend={statsLoading ? undefined : 'up'}
              loading={statsLoading}
            />
            <StatCard
              label="Active Now"
              value={statsLoading ? '—' : activeNow === null ? '—' : String(activeNow)}
              subValue={activeNow === null && !statsLoading ? 'Add last_sign_in_at to profiles for this' : 'Signed in last 15 min'}
              status={activeNow > 0 ? 'active' : undefined}
              loading={statsLoading}
            />
          </div>

          {/* USER MANAGEMENT APPROVALS */}
          <div className="bg-white rounded-[3.5rem] border border-slate-100 p-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <Users className="text-indigo-500" size={32} />
                <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">User Management</h3>
              </div>

              {/* FILTER TABS */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                {['all', 'pending', 'denied'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      filter === tab 
                      ? 'bg-white text-slate-800 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setShowCreateAdmin(true)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-orange-500 text-white px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-lg"
              >
                <UserPlus size={18} /> ADD NEW ADMIN
              </button>
            </div>
            
            <div className="space-y-6">
              {loading ? (
                <div className="flex flex-col items-center py-20 text-slate-400 gap-4">
                  <Loader2 className="animate-spin" size={40} />
                  <p className="font-bold">Syncing with Supabase...</p>
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <UserRequestRow
                    key={user.id}
                    id={user.id}
                    name={`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed'}
                    email={user.email}
                    role={user.role}
                    status={user.status}
                    refresh={fetchUsers}
                    onViewId={() => setViewIdUser({ id: user.id, name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed', email: user.email })}
                    onApproveClick={() => setConfirmAction({ type: 'approve', id: user.id, name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed' })}
                    onDenyClick={() => setConfirmAction({ type: 'deny', id: user.id, name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed' })}
                  />
                ))
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                   <p className="text-slate-400 font-bold">No users found in "{filter}" category.</p>
                </div>
              )}
            </div>
          </div>

          {/* CONTENT MANAGEMENT (Announcements) */}
          <div className="bg-white rounded-[3.5rem] border border-slate-100 p-10 lg:p-10 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <MessageSquare className="text-teal-500" size={32} />
              <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Content Management</h3>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Announcement Content</label>
                <textarea 
                  placeholder="Type here to edit text..."
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-[2rem] p-8 font-bold text-slate-800 min-h-[200px] outline-none transition-all"
                />
              </div>

              <button
                type="button"
                onClick={handlePostAnnouncement}
                disabled={posting || !announcementText.trim()}
                className={`w-full py-6 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all shadow-xl shadow-teal-500/20 ${
                  posting || !announcementText.trim()
                    ? 'bg-teal-300 cursor-not-allowed'
                    : 'bg-teal-500 hover:bg-teal-600'
                }`}
              >
                <Send size={24} />
                {posting ? 'Posting...' : 'POST ANNOUNCEMENT'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: System Controls */}
        <div className="space-y-10 lg:sticky lg:top-10">
          
          {/* SYSTEM MASTER SWITCH */}
          <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-8">System Control</h3>
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
              <div>
                <p className="font-black text-slate-800">Server Status</p>
                <p className="text-[10px] font-bold text-teal-500 uppercase">Online</p>
              </div>
              <div className="w-14 h-8 bg-orange-500 rounded-full relative p-1 cursor-pointer">
                <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <button 
              onClick={() => setShowLogs(true)}
              className="w-full mt-6 py-4 border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Activity size={18} /> VIEW SYSTEM LOGS
            </button>
          </div>

          {/* DATA EXPORT */}
          <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
             <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-8">Data Export</h3>
             <div className="space-y-4">
                <ExportItem label="User Activity Log" type="CSV - 2.3 MB" />
                <ExportItem label="System Health Report" type="PDF - 1.5 MB" />
             </div>
          </div>

          {/* QUICK INSIGHTS */}
          <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
             <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-8">Quick Insights</h3>
             <div className="space-y-4">
                <InsightCard color="orange" label="Most Active Hour" value="2:00 PM - 3:00 PM" />
                <InsightCard color="teal" label="Top Performing Module" value="Module 1: Basics" />
             </div>
          </div>
        </div>
      </div>

      {/* SYSTEM LOGS MODAL */}
      {showLogs && <SystemLogsModal onClose={() => setShowLogs(false)} />}
      {showCreateAdmin && <CreateAdminModal onClose={() => setShowCreateAdmin(false)} onCreated={fetchUsers} />}

      {/* VIEW USER ID MODAL */}
      {viewIdUser && (
        <ViewIdModal
          userId={viewIdUser.id}
          name={viewIdUser.name}
          email={viewIdUser.email}
          onClose={() => setViewIdUser(null)}
        />
      )}

      {/* CONFIRM APPROVE / DENY MODAL */}
      {confirmAction && (
        <ConfirmApproveDenyModal
          type={confirmAction.type}
          userName={confirmAction.name}
          onConfirm={async () => {
            setUpdatingStatus(true);
            try {
              const newStatus = confirmAction.type === 'approve' ? 'Verified' : 'Denied';
              const { error } = await supabase
                .from('profiles')
                .update({ status: newStatus })
                .eq('id', confirmAction.id);
              if (error) throw error;

              if (confirmAction.type === 'approve') {
                createLog("Admin approved user registration", `Target ID: ${confirmAction.id}`);
              } else {
                createLog("Admin denied user registration", `Target ID: ${confirmAction.id}`);
              }

              setConfirmAction(null);
              await fetchUsers();
            } catch (err) {
              console.error("Update status failed:", err.message);
              alert("Action failed: " + err.message);
            } finally {
              setUpdatingStatus(false);
            }
          }}
          onCancel={() => setConfirmAction(null)}
          loading={updatingStatus}
        />
      )}
    </div>
  );
}

// SUB-COMPONENTS
function StatCard({ label, value, subValue, status, trend, loading }) {
  const isTotalUsers = label === "Total Users";
  const alignmentClass = isTotalUsers ? "text-left" : "text-center flex flex-col items-center";

  return (
    <div className={`bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/60 min-h-[230px] flex flex-col justify-center ${alignmentClass}`}>
      <div className={`flex items-center gap-3 mb-4 ${isTotalUsers ? 'justify-between w-full' : 'justify-center'}`}>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{label}</p>
        {status === 'online' && <div className="w-4 h-4 bg-teal-500 rounded-full animate-pulse" />}
        {status === 'active' && <div className="w-4 h-4 bg-teal-500 rounded-full animate-pulse" />}
      </div>
      <div className="flex items-baseline gap-3 mb-4">
        <h4 className="text-4xl font-black text-slate-800 tracking-tighter">{loading && value === '—' ? '…' : value}</h4>
        {trend === 'up' && !loading && value !== '—' && <span className="text-teal-500 font-black text-sm">live</span>}
      </div>
      {isTotalUsers ? (
        <div className="space-y-4 w-full">
          <div className="h-4 w-full bg-orange-500 rounded-full overflow-hidden flex">
            <div className="h-full bg-teal-500 border-r-2 border-white" style={{ width: '85%' }} />
          </div>
          <div className="flex justify-between text-xs font-black uppercase tracking-tight">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500" />
              <span className="text-slate-500">Learners (85%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-slate-500">Educators (15%)</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-base font-bold text-slate-400">{subValue}</p>
      )}
    </div>
  );
}

function CreateAdminModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API Call - Here you'd use supabase.auth.admin.createUser
    setTimeout(() => {
      setLoading(false);
      alert("Admin Account Provisioned Successfully");
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[250] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3.5rem] w-full max-w-lg p-10 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute right-10 top-10 p-2 text-slate-300 hover:text-slate-800">
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create Authority</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Internal Admin Account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <input type="text" placeholder="First Name" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-red-500 rounded-2xl font-bold outline-none transition-all" required />
             <input type="text" placeholder="Last Name" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-red-500 rounded-2xl font-bold outline-none transition-all" required />
          </div>
          <input type="email" placeholder="Admin Email" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-red-500 rounded-2xl font-bold outline-none transition-all" required />
          <input type="password" placeholder="System Password" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-red-500 rounded-2xl font-bold outline-none transition-all" required />
          
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100 mb-4">
            <p className="text-[10px] text-red-600 font-bold leading-tight">
              NOTICE: This account will have full bypass permissions and access to the System Control Panel. 
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-red-600 text-white py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : "CONFIRM & CREATE ACCOUNT"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ViewIdModal({ userId, name, email, onClose }) {
  const [copied, setCopied] = useState(false);
  const copyId = () => {
    navigator.clipboard.writeText(userId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[250] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-10 top-10 p-2 text-slate-300 hover:text-slate-800">
          <X size={24} />
        </button>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
            <Eye size={28} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">User ID</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Profile identifier</p>
          </div>
        </div>
        <p className="text-sm font-bold text-slate-500 mb-1">Name</p>
        <p className="text-slate-800 font-black mb-4">{name}</p>
        <p className="text-sm font-bold text-slate-500 mb-1">Email</p>
        <p className="text-slate-800 font-bold mb-4 break-all">{email || '—'}</p>
        <p className="text-sm font-bold text-slate-500 mb-1">User ID (UUID)</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-xs font-mono text-slate-700 break-all">{userId}</code>
          <button
            type="button"
            onClick={copyId}
            className="p-3 bg-slate-100 hover:bg-indigo-500 hover:text-white rounded-xl transition-colors"
            title="Copy ID"
          >
            <Copy size={18} />
          </button>
        </div>
        {copied && <p className="text-teal-600 text-xs font-bold mt-2">Copied to clipboard.</p>}
      </div>
    </div>
  );
}

function ConfirmApproveDenyModal({ type, userName, onConfirm, onCancel, loading }) {
  const isApprove = type === 'approve';
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[250] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3.5rem] w-full max-w-md p-10 shadow-2xl relative">
        <button onClick={onCancel} className="absolute right-10 top-10 p-2 text-slate-300 hover:text-slate-800" disabled={loading}>
          <X size={24} />
        </button>
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isApprove ? 'bg-teal-50 text-teal-500' : 'bg-red-50 text-red-500'}`}>
            {isApprove ? <Check size={28} /> : <X size={28} />}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {isApprove ? 'Approve user?' : 'Deny user?'}
            </h2>
            <p className="text-slate-500 text-sm font-bold mt-1">
              {isApprove
                ? `Approve "${userName}" and set status to Verified. They will have full access.`
                : `Deny "${userName}". Their status will be set to Denied.`}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-4 border-2 border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
              isApprove
                ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20'
                : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : isApprove ? 'Confirm Approve' : 'Confirm Deny'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserRequestRow({ id, name, email, role, status, refresh, onViewId, onApproveClick, onDenyClick }) {
  const isPending = status === "Pending Review";
  const isDenied = status === "Denied";

  return (
    <div className={`flex flex-col xl:flex-row xl:items-center justify-between p-8 rounded-[2.5rem] border-2 transition-all group ${
      isDenied ? 'bg-red-50/30 border-red-50' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-100'
    }`}>
      <div className="flex items-center gap-6 mb-4 xl:mb-0">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDenied ? 'bg-red-100 text-red-500' : 'bg-slate-200 text-slate-500'}`}>
           <Users size={28} />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h5 className="font-black text-slate-800 text-lg">{name}</h5>
            <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase ${
              role === 'Educator' ? 'bg-orange-100 text-orange-600' : 'bg-teal-100 text-teal-600'
            }`}>
              {role}
            </span>
            {isPending && <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-3 py-1 rounded-lg uppercase">Pending Review</span>}
            {isDenied && <span className="bg-red-100 text-red-700 text-[10px] font-black px-3 py-1 rounded-lg uppercase">Denied</span>}
          </div>
          <p className="text-sm text-slate-400 font-bold">{email}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {isPending ? (
          <>
            <button
              type="button"
              onClick={onViewId}
              className="flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
            >
              <Eye size={16}/> VIEW ID
            </button>
            <button
              type="button"
              onClick={onApproveClick}
              className="p-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 shadow-lg shadow-teal-500/20"
              title="Approve"
            >
              <Check size={20}/>
            </button>
            <button
              type="button"
              onClick={onDenyClick}
              className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20"
              title="Deny"
            >
              <X size={20}/>
            </button>
          </>
        ) : (
          <div className="flex gap-2 items-center">
            {isDenied && (
               <button
                 type="button"
                 onClick={async () => {
                   try {
                     const { error } = await supabase.from('profiles').update({ status: 'Pending Review' }).eq('id', id);
                     if (error) throw error;
                     refresh();
                   } catch (err) {
                     alert("Action failed: " + err.message);
                   }
                 }}
                 className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-800 px-4"
               >
                 Re-evaluate
               </button>
            )}
            <button type="button" onClick={onViewId} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-black text-xs hover:bg-indigo-500 hover:text-white transition-colors">
              <Eye size={14}/> VIEW ID
            </button>
            <button type="button" className="p-2 text-slate-300 hover:text-slate-800"><MoreVertical size={20}/></button>
          </div>
        )}
      </div>
    </div>
  );
}

function ExportItem({ label, type }) {
  return (
    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-white border border-transparent hover:border-slate-100 transition-all">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white rounded-xl text-slate-400 group-hover:text-orange-500 transition-colors">
          <FileText size={20} />
        </div>
        <div>
          <p className="font-black text-slate-800 text-sm">{label}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">{type}</p>
        </div>
      </div>
      <Download size={18} className="text-slate-300 group-hover:text-slate-800 transition-colors" />
    </div>
  );
}

function InsightCard({ color, label, value }) {
  const styles = color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-teal-50 text-teal-600';
  return (
    <div className={`p-6 rounded-2xl ${styles}`}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{label}</p>
      <p className="font-black text-lg">{value}</p>
    </div>
  );
}

function SystemLogsModal({ onClose }) {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('system_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        setLogs(data || []);
      } catch (err) {
        console.error("Failed to load system logs:", err.message);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3.5rem] w-full max-w-4xl p-12 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-10 top-10 p-2 text-slate-300 hover:text-slate-800 transition-colors">
          <X size={32} />
        </button>
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter mb-10">System Logs</h2>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
          {loading ? (
            <div className="p-6 text-center text-slate-400 text-sm font-bold">
              Loading system logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm font-bold">
              No system logs recorded yet.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 border-b border-slate-50 flex justify-between items-center">
                <div>
                  <p className="text-slate-800 font-bold">{log.message}</p>
                  {log.user_identifier && (
                    <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono">
                      User: {log.user_identifier}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-bold">
                  {new Date(log.created_at).toLocaleString('en-PH')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}