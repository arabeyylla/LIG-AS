import React, { useState, useEffect } from 'react'; // Added useState and useEffect
import { Link, useNavigate } from 'react-router-dom';
import { User, Shield, LogOut, ChevronRight, X, AlertTriangle } from "lucide-react"; // Added AlertTriangle

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  
  // State to track if the user is in the "confirm" phase
  const [showConfirm, setShowConfirm] = useState(false);

  // Revert the button if the sidebar closes or after a timeout
  useEffect(() => {
    if (!isOpen) setShowConfirm(false);
  }, [isOpen]);

  const handleLogoutClick = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      // Auto-revert after 3 seconds if they don't click again
      setTimeout(() => setShowConfirm(false), 3000);
    } else {
      // Actually log out
      localStorage.removeItem('userToken'); 
      localStorage.removeItem('userRole');
      onClose();
      navigate('/', { replace: true });
    }
  };

  const menuItems = [
    { icon: <User size={20}/>, label: "Edit Profile", sub: "Personal info & Avatar", path: "/edit-profile" },
    { icon: <Shield size={20}/>, label: "Account Security", sub: "Privacy & Data", path: "/security" },
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
            <div className="w-24 h-24 bg-orange-100 rounded-[2.5rem] mx-auto flex items-center justify-center text-3xl font-black text-orange-600 mb-6 border-4 border-white shadow-2xl shadow-orange-100/50">MJ</div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Jasver Dela Cruz</h2>
            <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-widest">ID: 2024-008821</p>
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

          {/* Dynamic Logout Button */}
          <button 
            onClick={handleLogoutClick}
            className={`mt-auto py-5 rounded-[1.5rem] font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 ${
              showConfirm 
              ? "bg-red-600 text-white animate-pulse" 
              : "bg-[#0f172a] text-white hover:bg-red-600"
            }`}
          >
            {showConfirm ? (
              <>
                <AlertTriangle size={20} /> ARE YOU SURE? CLICK AGAIN
              </>
            ) : (
              <>
                <LogOut size={20}/> LOGOUT SESSION
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}