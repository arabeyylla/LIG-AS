// src/components/layout/DashboardLayout.jsx
import React, { useState } from 'react';
import Navbar from './Dash-Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, userRole }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar onProfileClick={() => setIsSidebarOpen(true)} userRole={userRole} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="p-6 lg:p-10 max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  );
}