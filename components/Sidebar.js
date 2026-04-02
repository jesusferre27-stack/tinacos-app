"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/", icon: "dashboard" },
    { name: "Pipeline", href: "/pipeline", icon: "account_tree" },
    { name: "Logistics", href: "/logistica", icon: "local_shipping" },
    { name: "Documents", href: "/documentos", icon: "description" },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-[#05183c] border-r border-[#2b4680]/15 flex flex-col py-6 gap-2">
      <div className="px-6 mb-8">
        <h1 className="text-lg font-bold tracking-widest text-[#dee5ff] uppercase">
          TINACOS LOGISTICS
        </h1>
        <p className="text-[0.6875rem] font-medium text-primary tracking-widest mt-1">
          LOGISTICS COMMAND
        </p>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 ${
                isActive
                  ? "bg-[#00225a] text-[#9bffce] border-l-4 border-[#7bd0ff]"
                  : "text-[#dee5ff]/60 hover:text-[#dee5ff] hover:bg-[#00225a]/50"
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span className="font-['Inter'] text-sm font-medium">
                {link.name}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-6 pt-6 border-t border-[#2b4680]/15">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center border border-outline-variant/30">
            <span className="material-symbols-outlined text-primary text-sm">
              person
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface">Admin Operator</p>
            <p className="text-[10px] text-on-surface-variant">
              v1.0.4 • ONLINE
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
