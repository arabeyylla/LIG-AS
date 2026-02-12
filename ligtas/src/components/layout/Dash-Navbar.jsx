import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, HelpCircle, Settings, Wind, CheckCircle2, 
  MessageSquare, ChevronRight, Info, Shield, ExternalLink 
} from "lucide-react";

export default function DashNavbar({ onProfileClick, userRole = "Learner" }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [notifFilter, setNotifFilter] = useState("all");

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  // --- DYNAMIC DATA LOGIC ---
  
  // 1. Define where the Logo redirects based on role
  const getHomePath = () => {
    if (userRole === "Admin") return "/admin";
    if (userRole === "Educator") return "/educator";
    return "/student";
  };

  // 2. Define User Display Details
  const userData = {
    Admin: { name: "Kizuna", sub: "Commander", color: "bg-red-600" },
    Educator: { name: "Prof. Santos", sub: "District Overseer", color: "bg-orange-500" },
    Learner: { name: "Jasver", sub: "Lvl 12 Learner", color: "bg-[#1e293b]" }
  };

  const currentProfile = userData[userRole] || userData.Learner;

  // Sample notifications (You could filter these by role too if needed)
  const notifications = [
    { id: 1, title: "Typhoon Warning", desc: "Signal #4 raised in your sector.", time: "2m ago", type: "update", unread: true },
    { id: 2, title: "Mission Accomplished", desc: "Fire drill simulation passed.", time: "1h ago", type: "check", unread: false },
  ];

  const filteredNotifs = notifFilter === "all" 
    ? notifications 
    : notifications.filter(n => n.unread);

  return (
    <nav className="bg-white border-b border-slate-200 px-6 lg:px-12 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          {/* FIX: Link now uses getHomePath() instead of hardcoded /student */}
          <Link to={getHomePath()} className="group flex items-center gap-2 transition-transform active:scale-95">
            <h1 className="text-2xl font-black tracking-tighter text-[#1e293b] group-hover:text-orange-500 transition-colors">
            LIG<span className="text-orange-500 group-hover:text-[#1e293b]">+</span>AS
            </h1>
            {userRole === "Admin" && (
                <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded border border-red-100 ml-1">HQ</span>
            )}
        </Link>
        </div>
        
        <div className="flex items-center gap-4 lg:gap-8">
          <div className="hidden md:flex items-center gap-4 text-slate-400 border-r border-slate-100 pr-8 relative">
             
             {/* Notifications */}
             <div className="relative">
                <button onClick={() => toggleDropdown('notif')} className={`hover:text-orange-500 transition-colors p-2.5 rounded-xl ${activeDropdown === 'notif' ? 'bg-orange-50 text-orange-500' : ''}`}>
                  <Bell size={22} />
                  {notifications.some(n => n.unread) && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
                
                {activeDropdown === 'notif' && (
                  <div className="absolute right-0 mt-4 w-96 bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2rem] overflow-hidden z-[60]">
                    <div className="bg-slate-50 p-6 border-b border-slate-100">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-black text-sm uppercase tracking-widest text-slate-800">Intel Feed</h4>
                        <div className="flex bg-slate-200 p-1 rounded-lg">
                          <button onClick={() => setNotifFilter("all")} className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${notifFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>ALL</button>
                          <button onClick={() => setNotifFilter("unread")} className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${notifFilter === 'unread' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>UNREAD</button>
                        </div>
                      </div>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto">
                      {filteredNotifs.length > 0 ? filteredNotifs.map(n => (
                        <div key={n.id} className={`p-5 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 relative ${n.unread ? 'bg-orange-50/20' : ''}`}>
                          {n.unread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>}
                          <div className="flex gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.unread ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                              {n.type === 'update' ? <Wind size={18}/> : <CheckCircle2 size={18}/>}
                            </div>
                            <div className="text-left">
                              <p className={`text-sm font-black ${n.unread ? 'text-slate-900' : 'text-slate-500'}`}>{n.title}</p>
                              <p className="text-xs text-slate-500 mt-1">{n.desc}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-2">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="p-10 text-center text-slate-400 text-xs font-bold">No unread intel reports.</div>
                      )}
                    </div>
                  </div>
                )}
             </div>

             {/* FAQs - Settings omitted for brevity, same as your code */}
          </div>
          
          {/* Sidebar Trigger */}
          <button onClick={onProfileClick} className="flex items-center gap-3 group">
            <div className="text-right hidden sm:block">
              {/* FIX: Dynamic Name */}
              <p className="text-sm font-black text-slate-700">{currentProfile.name}</p>
              {/* FIX: Dynamic Subtitle */}
              <p className="text-[10px] text-slate-400 uppercase font-black">{currentProfile.sub}</p>
            </div>
            {/* FIX: Dynamic Avatar Background */}
            <div className={`w-12 h-12 ${currentProfile.color} rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-slate-200 group-hover:scale-105 transition-transform uppercase`}>
                {currentProfile.name.charAt(0)}
            </div>
          </button>
        </div>
      </nav>
  );
}