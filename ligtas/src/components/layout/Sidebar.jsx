import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Shield, LogOut, ChevronRight, X, AlertTriangle, Settings} from "lucide-react";

export default function Sidebar({ isOpen, onClose, userRole = "Learner" }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) setShowConfirm(false);
  }, [isOpen]);

  const handleLogoutClick = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    } else {
      localStorage.removeItem('userToken'); 
      localStorage.removeItem('userRole');
      onClose();
      navigate('/', { replace: true });
    }
  };

  // --- DYNAMIC DATA LOGIC ---
  const userData = {
    Admin: { 
      name: "Kizuna Admin", 
      id: "HQ-SYS-9901", 
      initials: "KA",
      avatarBg: "bg-red-600",
      textColor: "text-red-600"
    },
    Educator: { 
      name: "Prof. Santos", 
      id: "EDU-2024-552", 
      initials: "PS",
      avatarBg: "bg-orange-500",
      textColor: "text-orange-600"
    },
    Learner: { 
      name: "Jasver Dela Cruz", 
      id: "ID: 2024-008821", 
      initials: "MJ",
      avatarBg: "bg-orange-100",
      textColor: "text-orange-600"
    }
  };

  const current = userData[userRole] || userData.Learner;

  // You can also change menu items based on role
  const menuItems = [
    { icon: <User size={20}/>, label: "Edit Profile", sub: "Personal info & Avatar", path: "/edit-profile" },
    { icon: <Shield size={20}/>, label: "Account Security", sub: "Privacy & Data", path: "/security" },
    // Only show system settings to Admin
    ...(userRole === "Admin" ? [{ icon: <Settings size={20}/>, label: "System Config", sub: "Global Parameters", path: "/config" }] : []),
  ];

  return (
    <>
      {/* Background Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] transition-opacity" onClick={onClose} />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-[100] transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-12 flex flex-col h-full overflow-y-auto">
          <button onClick={onClose} className="self-end text-slate-300 hover:text-slate-800 mb-6 transition-colors">
            <X size={32} />
          </button>
          
          <div className="text-center mb-12">
            {/* DYNAMIC AVATAR */}
            <div className={`w-24 h-24 ${current.avatarBg} rounded-[2.5rem] mx-auto flex items-center justify-center text-3xl font-black ${userRole === "Admin" ? "text-white" : current.textColor} mb-6 border-4 border-white shadow-2xl shadow-slate-200/50`}>
              {current.initials}
            </div>
            
            {/* DYNAMIC NAME & ID */}
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{current.name}</h2>
            <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-widest">{current.id}</p>
            
            {userRole === "Admin" && (
              <span className="inline-block mt-3 px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-full uppercase">Superuser Access</span>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Account Management</h3>
            {menuItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.path} 
                onClick={onClose}
                className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-orange-50 rounded-[1.5rem] group transition-all border border-transparent hover:border-orange-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-orange-500 shadow-sm transition-colors">
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-700">{item.label}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>

          <button 
            onClick={handleLogoutClick}
            className={`mt-auto py-5 rounded-[1.5rem] font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 ${
              showConfirm 
              ? "bg-red-600 text-white animate-pulse" 
              : "bg-[#0f172a] text-white hover:bg-red-600"
            }`}
          >
            {showConfirm ? (
              <><AlertTriangle size={20} /> ARE YOU SURE? CLICK AGAIN</>
            ) : (
              <><LogOut size={20}/> LOGOUT SESSION</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}