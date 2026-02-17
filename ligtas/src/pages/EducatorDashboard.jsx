import React, { useState, useEffect } from 'react';
import { 
  Plus, Users, BarChart3, BookOpen, 
  FileText, PieChart, PlusCircle, 
  Search, Filter, Edit, Trash2, 
  Info, Calendar, CheckCircle, Loader2, Lock, Clock
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function EducatorDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch User Profile & Verification Status
  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          setProfile(data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err.message);
      } finally {
        setLoading(false);
      }
    }
    getProfile();
  }, []);

  // 2. Loading State
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
        <p className="font-black text-slate-400 uppercase tracking-widest">Initializing Command Center...</p>
      </div>
    );
  }

  // 3. Verification Gatekeeper
  if (profile?.status === 'Pending Review') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl shadow-slate-200 border border-slate-100 text-center max-w-2xl">
          <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Clock size={48} />
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Account Under Review</h2>
          <p className="text-slate-500 text-xl font-bold mt-4 leading-relaxed">
            Hi {profile?.first_name || 'Educator'}, your credentials are being verified by our administrators. 
            Once approved, you'll have full access to your students and classes.
          </p>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="mt-10 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all"
          >
            LOG OUT
          </button>
        </div>
      </div>
    );
  }

  // 4. Main Dashboard (Only shows if status === 'Verified')
  return (
    <div className="max-w-[1800px] mx-auto py-4 px-6 lg:px-0 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="mb-12">
        <h1 className="text-5xl font-black text-slate-800 tracking-tighter">Command Center</h1>
        <p className="text-slate-400 text-xl font-bold mt-2">
          Welcome back, Prof. {profile?.last_name || 'Santos'}. Here's your class overview.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        
        {/* LEFT & CENTER: Class Management */}
        <div className="lg:col-span-3 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <ClassCard title="Grade 10 - Sec A" students="32" completion="85%" atRisk="3" active />
            <ClassCard title="Grade 10 - Sec B" students="28" completion="72%" atRisk="5" active />
            
            <button 
              onClick={() => setShowModal(true)}
              className="border-4 border-dashed border-slate-200 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-6 group hover:border-orange-500 hover:bg-orange-50/30 transition-all min-h-[220px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner">
                <Plus size={40} />
              </div>
              <div className="text-center">
                <p className="font-black text-xl text-slate-800">Add New Section</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Create another class group</p>
              </div>
            </button>
          </div>

          {/* CLASS ANALYTICS PREVIEW */}
          <div className="bg-white rounded-[3.5rem] border border-slate-100 p-10 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <BarChart3 className="text-orange-500" size={32} />
              <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Global Class Analytics</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-red-50 rounded-[2.5rem] border border-red-100">
                <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-3">Most Failed Module</p>
                <h4 className="font-black text-slate-800 text-2xl">Module 4: Urban Fire</h4>
                <p className="text-sm text-red-600 font-bold mt-2">42% of students failed this</p>
              </div>
              <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100">
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3">Avg. Quiz Score</p>
                <div className="flex items-end gap-4">
                    <h4 className="font-black text-slate-800 text-5xl">78/100</h4>
                    <span className="text-sm text-teal-500 font-bold mb-2">+2.5% from last week</span>
                </div>
              </div>
            </div>
          </div>

          {/* STUDENT ROSTER */}
          <div className="bg-white rounded-[3.5rem] border border-slate-100 p-10 shadow-sm">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-7">
              <h3 className="font-black text-slate-800 text-2xl tracking-tight">Student Roster (Grade 10 - Sec A)</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="text" placeholder="Search student..." className="pl-14 pr-8 py-4 bg-slate-50 rounded-2xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 w-80" />
                </div>
                <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-800 transition-colors">
                  <Filter size={24} />
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
               <StudentRow name="Penduko, Pedro" xp="850" progress={20} status="AT-RISK" />
               <StudentRow name="Dela Cruz, Juan" xp="2,400" progress={90} status="COMPLETED" />
               <StudentRow name="Santos, Maria" xp="1,250" progress={45} status="ON-TRACK" />
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-10 lg:sticky lg:top-10">
          <div className="bg-[#0f172a] rounded-[3rem] p-10 text-white shadow-2xl">
            <h3 className="font-black text-2xl mb-2">Assignment Manager</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Broadcast new mission</p>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Module</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-base font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 text-white appearance-none">
                  <option className="bg-slate-900">Select Module</option>
                  <option className="bg-slate-900">Typhoon Safety</option>
                  <option className="bg-slate-900">Earthquake Drill</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Deadline</label>
                <div className="relative">
                  <Calendar size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-base font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 text-white" />
                </div>
              </div>
              <button className="w-full bg-orange-500 hover:bg-orange-600 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all mt-6 shadow-lg shadow-orange-500/20 active:scale-95">
                <PlusCircle size={20} /> ASSIGN TO CLASS
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
            <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest mb-8">Quick Actions</h3>
            <div className="space-y-4">
              <button 
                onClick={() => setShowModal(true)}
                className="w-full py-5 bg-teal-500 text-white rounded-2xl font-black text-sm hover:bg-teal-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-teal-500/20">
                <Plus size={22}/> CREATE CLASS
              </button>
              <button className="w-full py-5 border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                <BookOpen size={22}/> VIEW ALL MODULES
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && <AddSectionModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

// SUB-COMPONENTS
function ClassCard({ title, students, completion, atRisk, active }) {
  return (
    <div className="bg-white p-10 rounded-[3rem] border-b-[6px] border-orange-500 shadow-xl shadow-slate-200/60 transition-transform hover:-translate-y-2">
      <div className="flex justify-between items-start mb-8">
        <h4 className="font-black text-slate-800 text-2xl leading-tight">{title}</h4>
        {active && <span className="bg-teal-500 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">Active</span>}
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div><p className="text-3xl font-black text-slate-800">{students}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Students</p></div>
        <div><p className="text-3xl font-black text-teal-500">{completion}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Avg. Comp.</p></div>
        <div><p className="text-3xl font-black text-red-500">{atRisk}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">At-Risk</p></div>
      </div>
    </div>
  );
}

function StudentRow({ name, xp, progress, status }) {
  const isAtRisk = status === "AT-RISK";
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 hover:bg-white rounded-[2rem] border border-transparent hover:border-slate-100 transition-all group">
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white ${isAtRisk ? 'bg-orange-500' : 'bg-[#0f172a]'}`}>
          {name.charAt(0)}
        </div>
        <div>
          <h5 className="font-black text-slate-800">{name}</h5>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Last Login: Just Now</p>
        </div>
      </div>
      <div className="flex-1 md:mx-12 space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-slate-400">Progress</span><span className="text-slate-800">{progress}%</span></div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${isAtRisk ? 'bg-orange-500' : 'bg-teal-500'}`} style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right"><p className="text-sm font-black text-slate-800">{xp} XP</p><p className="text-[10px] font-bold text-slate-400 uppercase">Total Score</p></div>
        <div className="flex items-center gap-2">
          {isAtRisk ? (
            <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1"><Info size={12}/> AT-RISK</span>
          ) : (
            <span className="bg-teal-50 text-teal-600 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle size={12}/> ON-TRACK</span>
          )}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 hover:text-orange-500"><Edit size={16}/></button>
            <button className="p-2 hover:text-red-500"><Trash2 size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddSectionModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-lg p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-8">Create New Section</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class Title</label>
            <input type="text" placeholder="e.g. Science & Disaster Prep" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl font-bold outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Section Name</label>
            <input type="text" placeholder="e.g. Grade 10 - Sec C" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl font-bold outline-none transition-all" />
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={onClose} className="flex-1 py-4 px-6 border-2 border-slate-100 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
            <button className="flex-1 py-4 px-6 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 transition-all shadow-lg">Create Section</button>
          </div>
        </div>
      </div>
    </div>
  );
}