"use client";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between px-4 md:px-8 h-16 w-full sticky top-0 z-50 bg-[#060e20] shadow-[0_32px_32px_rgba(222,229,255,0.04)]">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-primary cursor-pointer hover:bg-surface-container-highest p-2 rounded md:hidden">
          menu
        </span>
        <span className="material-symbols-outlined text-primary hidden md:block">
          grid_view
        </span>
        <div className="relative hidden sm:block">
          <input
            className="bg-surface-container-low border-none rounded-md px-10 py-1.5 text-sm w-40 md:w-80 focus:ring-1 focus:ring-primary text-on-surface transition-all placeholder-on-surface-variant"
            placeholder="Search..."
            type="text"
          />
          <span className="material-symbols-outlined absolute left-3 top-1.5 text-on-surface-variant/50 text-base">
            search
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex gap-2">
          <button className="hidden md:block px-3 py-1 text-xs font-medium bg-surface-container-highest text-tertiary rounded border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
            AGENT STATUS: ACTIVE
          </button>
          <button className="px-3 py-1 text-xs font-medium hover:bg-surface-container-highest text-on-surface-variant transition-colors rounded">
            FILTER
          </button>
        </div>
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/40 cursor-pointer">
          AO
        </div>
      </div>
    </header>
  );
}
