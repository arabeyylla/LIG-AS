import React, { useState, useEffect } from 'react';
import Navbar from './Dash-Navbar';
import Sidebar from './Sidebar';
import { supabase } from '../../lib/supabaseClient';

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    role: "Learner",
    name: "Loading...",
    id: "ID: ----",
    initials: "??"
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, first_name, last_name, email, username')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        const role = user.user_metadata?.role || "Learner";
        const fName = user.user_metadata?.first_name || "Tactical";
        const lName = user.user_metadata?.last_name || "User";
        setUserInfo({
          role,
          name: `${fName} ${lName}`.trim() || "Tactical User",
          id: user.user_metadata?.username ? `ID: ${user.user_metadata.username}` : `UID: ${user.id.slice(0, 8)}`,
          initials: (fName?.[0] || "?") + (lName?.[0] || "?")
        });
        return;
      }

      const fName = profile.first_name || "";
      const lName = profile.last_name || "";
      const name = `${fName} ${lName}`.trim() || profile.email || "User";
      const initials = (fName?.[0] || "") + (lName?.[0] || "") || profile.email?.[0]?.toUpperCase() || "?";

      setUserInfo({
        role: profile.role || "Learner",
        name,
        id: profile.username ? `ID: ${profile.username}` : `UID: ${user.id.slice(0, 8)}`,
        initials: initials.slice(0, 2).toUpperCase()
      });
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar 
        onProfileClick={() => setIsSidebarOpen(true)} 
        userRole={userInfo.role} 
        userName={userInfo.name} 
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        userRole={userInfo.role}
        userInfo={userInfo} 
      />
      
      <main className="p-6 lg:p-10 max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  );
}