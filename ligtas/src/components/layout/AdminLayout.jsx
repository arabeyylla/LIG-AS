import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { 
  LayoutDashboard, Megaphone, MessageSquare, 
  Image, BarChart3, LogOut, ChevronRight, Menu, X
} from "lucide-react";

const navItems = [
  { path: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { path: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { path: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { path: "/admin/gallery", label: "Gallery", icon: Image },
  { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed h-full z-50 w-64 lg:w-72 bg-[#0a1120] text-white flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 lg:p-8 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-black tracking-tighter">
              LIG<span className="text-orange-500">+</span>AS
            </h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Admin Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 lg:px-5 py-3 lg:py-3.5 rounded-xl font-bold text-sm transition-all group ${
                  isActive
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        <div className="p-3 lg:p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 lg:px-5 py-3 lg:py-3.5 rounded-xl font-bold text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 lg:ml-72">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-700 hover:text-orange-500" aria-label="Open menu">
            <Menu size={22} />
          </button>
          <h1 className="text-lg font-black tracking-tighter text-slate-800">
            LIG<span className="text-orange-500">+</span>AS <span className="text-xs font-bold text-slate-400 ml-1">Admin</span>
          </h1>
        </div>

        <main className="p-4 sm:p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
