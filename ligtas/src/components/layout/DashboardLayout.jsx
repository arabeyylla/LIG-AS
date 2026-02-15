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
      if (user) {
        const role = user.user_metadata?.role || "Learner";
        const fName = user.user_metadata?.first_name || "Tactical";
        const lName = user.user_metadata?.last_name || "User";
        
        setUserInfo({
          role: role,
          name: `${fName} ${lName}`,
          id: user.user_metadata?.username ? `ID: ${user.user_metadata.username}` : `UID: ${user.id.slice(0,8)}`,
          initials: fName[0] + lName[0]
        });
      }
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