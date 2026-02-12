import React, { useState } from 'react';
import { 
  ShieldCheck, Users, Activity, Settings, 
  Download, MessageSquare, Check, X, 
  Eye, MoreVertical, Search, Power,
  FileText, Clock, AlertTriangle, Send
} from 'lucide-react';

export default function AdminDashboard() {
  const [showLogs, setShowLogs] = useState(false);

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
          
          {/* SYSTEM STATS OVERVIEW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard label="Server Status" value="Online" subValue="99.9% Uptime" status="online" />
            <StatCard label="Total Users" value="1,248" subValue="+12% this week" trend="up" />
            <StatCard label="Active Now" value="84" subValue="Current active sessions" status="active" />
          </div>

          {/* USER MANAGEMENT APPROVALS */}
          <div className="bg-white rounded-[3.5rem] border border-slate-100 p-10 lg:p-10 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <Users className="text-indigo-500" size={32} />
              <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">User Management</h3>
            </div>
            
            <div className="space-y-6">
              <UserRequestRow 
                name="Juan Educator" 
                email="juan@educator.edu.ph" 
                role="Educator" 
                status="Pending Review" 
              />
              <UserRequestRow 
                name="Maria Learner" 
                email="student2024@learner.edu.ph" 
                role="Learner" 
                status="Verified" 
              />
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
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Landing Page Announcement</label>
                <div className="w-full border-4 border-dashed border-slate-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-all cursor-pointer">
                   <Download size={32} className="mb-2" />
                   <p className="font-bold">Upload Announcement File (JPG/PDF)</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Announcement Content</label>
                <textarea 
                  placeholder="Type here to edit text..."
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-500 rounded-[2rem] p-8 font-bold text-slate-800 min-h-[200px] outline-none transition-all"
                />
              </div>

              <button className="w-full bg-teal-500 hover:bg-teal-600 py-6 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all shadow-xl shadow-teal-500/20">
                <Send size={24} /> POST ANNOUNCEMENT
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
    </div>
  );
}

// SUB-COMPONENTS
function StatCard({ label, value, subValue, status, trend }) {
  const isTotalUsers = label === "Total Users";
  
  // Logic to center everything EXCEPT the Total Users card
  const alignmentClass = isTotalUsers ? "text-left" : "text-center flex flex-col items-center";

  return (
    <div className={`bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/60 min-h-[230px] flex flex-col justify-center ${alignmentClass}`}>
      
      {/* LABEL */}
      <div className={`flex items-center gap-3 mb-4 ${isTotalUsers ? 'justify-between w-full' : 'justify-center'}`}>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{label}</p>
        {status === 'online' && <div className="w-4 h-4 bg-teal-500 rounded-full animate-pulse" />}
      </div>
      
      {/* VALUE */}
      <div className="flex items-baseline gap-3 mb-4">
        <h4 className="text-4xl font-black text-slate-800 tracking-tighter">{value}</h4>
        {trend === 'up' && <span className="text-teal-500 font-black text-sm">+12%</span>}
      </div>

      {/* PROGRESS BAR - Specific to Total Users */}
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
        /* SUBVALUE */
        <p className="text-base font-bold text-slate-400">{subValue}</p>
      )}
    </div>
  ); 
}

function UserRequestRow({ name, email, role, status }) {
  const isPending = status === "Pending Review";
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between p-8 bg-slate-50 hover:bg-white rounded-[2.5rem] border-2 border-transparent hover:border-slate-100 transition-all group">
      <div className="flex items-center gap-6 mb-4 xl:mb-0">
        <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-500">
           <Users size={28} />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h5 className="font-black text-slate-800 text-lg">{name}</h5>
            <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase ${role === 'Educator' ? 'bg-orange-100 text-orange-600' : 'bg-teal-100 text-teal-600'}`}>
              {role}
            </span>
            {isPending && <span className="bg-yellow-100 text-yellow-700 text-[10px] font-black px-3 py-1 rounded-lg uppercase">Pending Review</span>}
          </div>
          <p className="text-sm text-slate-400 font-bold">{email}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {isPending ? (
          <>
            <button className="flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20">
              <Eye size={16}/> VIEW ID
            </button>
            <button className="p-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 shadow-lg shadow-teal-500/20"><Check size={20}/></button>
            <button className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20"><X size={20}/></button>
          </>
        ) : (
          <button className="p-4 text-slate-300 hover:text-slate-800"><MoreVertical size={24}/></button>
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
  const logs = [
    { time: "2026-02-07 17:29", msg: "Simulation failed: Volcanic Eruption Response", user: "learner_264" },
    { time: "2026-02-07 16:27", msg: "Simulation replayed: Fire Response", user: "learner_412" },
    { time: "2026-02-07 16:14", msg: "Simulation completed: Landslide Response", user: "learner_204" },
    { time: "2026-02-07 15:42", msg: "Simulation started: Typhoon Preparedness", user: "learner_089" },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3.5rem] w-full max-w-4xl p-12 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-10 top-10 p-2 text-slate-300 hover:text-slate-800 transition-colors">
          <X size={32} />
        </button>
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter mb-10">System Logs</h2>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
          {logs.map((log, i) => (
            <div key={i} className="p-6 bg-slate-50 rounded-2xl font-bold text-sm text-slate-600 flex gap-4">
              <span className="text-slate-400 whitespace-nowrap">[{log.time}]</span>
              <p>{log.msg} <span className="text-indigo-500">(User: {log.user})</span></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}