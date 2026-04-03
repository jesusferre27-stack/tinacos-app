"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function ClientLayoutWrapper({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-[#060e20]">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar with Toggle Prop */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <main className={`transition-all duration-300 ${sidebarOpen ? "ml-0" : "ml-0 md:ml-64"} min-h-screen flex flex-col`}>
        <Topbar onToggle={toggleSidebar} />
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
