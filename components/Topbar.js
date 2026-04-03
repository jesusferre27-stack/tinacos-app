"use client";

export default function Topbar({ onToggle }) {
  return (
    <header className="flex items-center justify-between px-4 md:px-8 h-16 w-full sticky top-0 z-50 bg-[#060e20] shadow-[0_32px_32px_rgba(222,229,255,0.04)] border-b border-[#2b4680]/15">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu - Visible only on mobile */}
        <button 
          onClick={onToggle}
          className="material-symbols-outlined text-[#7bd0ff] cursor-pointer hover:bg-[#00225a] p-2 rounded md:hidden active:scale-95 transition-all"
        >
          menu
        </button>
        
        <span className="material-symbols-outlined text-[#7bd0ff] hidden md:block opacity-50">
          grid_view
        </span>
        
        <div className="relative hidden sm:block">
          <input
            className="bg-[#001b3d] border border-[#2b4680]/20 rounded-md px-10 py-1.5 text-sm w-40 md:w-80 focus:ring-1 focus:ring-[#7bd0ff] text-[#dee5ff] transition-all placeholder-[#dee5ff]/30 shadow-inner"
            placeholder="Search leads, routes..."
            type="text"
          />
          <span className="material-symbols-outlined absolute left-3 top-1.5 text-[#dee5ff]/30 text-base">
            search
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex gap-2">
          <div className="hidden lg:flex items-center gap-2 bg-[#00225a] px-3 py-1.5 rounded-lg border border-[#7bd0ff]/10">
            <span className="w-2 h-2 rounded-full bg-[#9bffce] animate-pulse" />
            <span className="text-[10px] font-bold text-[#9bffce] uppercase tracking-widest">
              Live Terminal
            </span>
          </div>
          <button className="px-3 py-1.5 text-[10px] font-bold hover:bg-[#00225a] text-[#7bd0ff] transition-all rounded uppercase tracking-wider">
            FILTER
          </button>
        </div>
        <div className="h-9 w-9 rounded-full bg-[#00225a] flex items-center justify-center text-[#7bd0ff] font-bold text-xs border border-[#7bd0ff]/20 shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform">
          AO
        </div>
      </div>
    </header>
  );
}
