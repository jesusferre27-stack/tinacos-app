"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ isOpen, onToggle }) {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/", icon: "dashboard" },
    { name: "Pipeline", href: "/pipeline", icon: "account_tree" },
    { name: "Logistics", href: "/logistica", icon: "local_shipping" },
    { name: "Documents", href: "/documentos", icon: "description" },
  ];

  return (
    <aside 
      className={`h-screen w-64 fixed left-0 top-0 z-40 bg-[#05183c] border-r border-[#2b4680]/15 flex flex-col py-6 gap-2 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full md:flex"
      }`}
    >
      <div className="px-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold tracking-widest text-[#dee5ff] uppercase leading-none">
            TINACOS
          </h1>
          <p className="text-[0.6875rem] font-medium text-primary tracking-widest mt-1">
            LOGISTICS COMMAND
          </p>
        </div>
        {/* Close button for mobile */}
        <button 
          onClick={onToggle}
          className="md:hidden text-[#7bd0ff] hover:bg-[#00225a] p-1 rounded"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => {
                if (window.innerWidth < 768) onToggle();
              }}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 rounded-lg ${
                isActive
                  ? "bg-[#00225a] text-[#9bffce] shadow-[0_0_15px_rgba(155,255,206,0.1)]"
                  : "text-[#dee5ff]/60 hover:text-[#dee5ff] hover:bg-[#00225a]/50"
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? "text-[#9bffce]" : ""}`}>
                {link.icon}
              </span>
              <span className="font-['Inter'] text-sm font-medium">
                {link.name}
              </span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7bd0ff] shadow-[0_0_8px_#7bd0ff]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-6 pt-6 border-t border-[#2b4680]/15">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00225a] flex items-center justify-center border border-[#2b4680]/30 shadow-inner">
            <span className="material-symbols-outlined text-[#7bd0ff] text-sm">
              person
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#dee5ff]">Admin Operator</p>
            <p className="text-[10px] text-[#dee5ff]/40 uppercase tracking-tighter">
              v1.0.4 • ONLINE
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
