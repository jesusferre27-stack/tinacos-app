export default function Pipeline() {
  return (
    <div className="p-8 pb-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary-container text-primary text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">
              Lead ID: #XT-9942
            </span>
            <span className="text-on-surface-variant text-xs font-label">
              Initiated 12:44:02 GMT
            </span>
          </div>
          <h2 className="text-3xl font-semibold text-on-surface tracking-tight leading-none">
            Vortex Global Logistics
          </h2>
          <p className="text-on-surface-variant text-sm mt-2 max-w-xl">
            Deep-tracking lead progression through the automated AI agent
            cluster. Currently performing intent analysis and route optimization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-surface-container-highest border border-outline-variant/20 text-on-surface px-4 py-2 text-sm font-medium hover:bg-surface-bright transition-colors flex items-center gap-2 rounded">
            <span className="material-symbols-outlined text-lg">history</span>
            Audit Log
          </button>
          <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-5 py-2 text-sm font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 rounded shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined text-lg">refresh</span>
            RETRY PIPELINE
          </button>
        </div>
      </div>

      {/* Horizontal Pipeline Stepper */}
      <div className="bg-surface-container rounded-xl p-8 mb-8 border border-outline-variant/10 hidden md:block">
        <div className="relative flex justify-between items-center">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-outline-variant/20 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-0 w-[75%] h-[2px] bg-gradient-to-r from-tertiary to-primary -translate-y-1/2 transition-all"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary shadow-[0_0_15px_rgba(155,255,206,0.3)] mb-3">
              <span className="material-symbols-outlined text-xl">check_circle</span>
            </div>
            <span className="text-xs font-bold text-on-surface tracking-tight">Extractor</span>
            <span className="text-[10px] text-tertiary mt-1 uppercase">Success</span>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary shadow-[0_0_15px_rgba(155,255,206,0.3)] mb-3">
              <span className="material-symbols-outlined text-xl">check_circle</span>
            </div>
            <span className="text-xs font-bold text-on-surface tracking-tight">Filtrador</span>
            <span className="text-[10px] text-tertiary mt-1 uppercase">Success</span>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-surface-bright border-2 border-primary flex items-center justify-center text-primary mb-3">
              <span className="material-symbols-outlined text-xl animate-spin">sync</span>
            </div>
            <span className="text-xs font-bold text-on-surface tracking-tight">Generador</span>
            <span className="text-[10px] text-primary mt-1 uppercase">Processing</span>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-outline-variant/50 flex items-center justify-center text-on-surface-variant mb-3">
              <span className="material-symbols-outlined text-xl">hourglass_empty</span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant tracking-tight">Enviador</span>
            <span className="text-[10px] text-on-surface-variant/50 mt-1 uppercase">Pending</span>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-outline-variant/50 flex items-center justify-center text-on-surface-variant mb-3">
              <span className="material-symbols-outlined text-xl">near_me</span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant tracking-tight">Rutero</span>
            <span className="text-[10px] text-on-surface-variant/50 mt-1 uppercase">Pending</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card: Active Stage */}
          <div className="bg-surface-container-highest p-6 rounded-lg border-t-2 border-primary flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-primary-dim uppercase tracking-widest font-bold">
                  Stage 03 / Active
                </span>
                <h3 className="text-xl font-semibold mt-1">Generador AI</h3>
              </div>
              <span className="bg-primary-container text-on-primary-container text-[10px] px-2 py-1 rounded">
                Agent: G-402
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-outline-variant/10 pb-2">
                <span className="text-on-surface-variant">Status:</span>
                <span className="text-primary font-bold">Synthesizing Proposal...</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-outline-variant/10 pb-2">
                <span className="text-on-surface-variant">Token Usage:</span>
                <span className="text-on-surface">1,402 / 2,048</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">Elapsed:</span>
                <span className="text-on-surface">4.2s</span>
              </div>
            </div>
            <div className="mt-auto pt-4 flex gap-2">
              <button className="flex-1 bg-surface-container text-on-surface text-xs font-bold py-2 hover:bg-surface-bright rounded transition-colors uppercase">
                Manual Overwrite
              </button>
              <button className="bg-surface-container text-on-surface p-2 hover:bg-surface-bright rounded transition-colors">
                <span className="material-symbols-outlined text-sm">visibility</span>
              </button>
            </div>
          </div>
          
          {/* Card: Error Encountered */}
          <div className="bg-surface-container-low p-6 rounded-lg border-t-2 border-error/40 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-error-dim uppercase tracking-widest font-bold">
                  Stage 01 / Warning
                </span>
                <h3 className="text-xl font-semibold mt-1">Extractor Alpha</h3>
              </div>
              <span className="bg-error-container text-on-error-container text-[10px] px-2 py-1 rounded font-bold">
                LATENCY
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Agent reported high latency during API calls to CRM. Some metadata fields might be incomplete.
            </p>
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2 text-[10px] text-error font-medium">
                <span className="material-symbols-outlined text-sm">warning</span>
                Missing Field: revenue_bracket
              </div>
            </div>
            <div className="mt-auto pt-4">
              <button className="w-full bg-error-container text-on-error-container text-xs font-bold py-2 hover:brightness-110 rounded transition-all uppercase">
                Retry Sub-process
              </button>
            </div>
          </div>
          
          {/* Card: Success Log */}
          <div className="bg-surface-container-low p-6 rounded-lg border-t-2 border-tertiary/20 flex flex-col gap-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                Live Execution Log
              </h4>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">
                filter_list
              </span>
            </div>
            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex gap-4 items-start">
                <span className="text-[10px] text-on-surface-variant/40 mt-1 whitespace-nowrap">
                  12:44:05
                </span>
                <p className="text-xs text-on-surface">
                  <span className="text-tertiary font-medium">[Extractor]</span> Successfully retrieved data
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <span className="text-[10px] text-on-surface-variant/40 mt-1 whitespace-nowrap">
                  12:44:08
                </span>
                <p className="text-xs text-on-surface">
                  <span className="text-tertiary font-medium">[Filtrador]</span> Lead verified. Match 94%.
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <span className="text-[10px] text-on-surface-variant/40 mt-1 whitespace-nowrap">
                  12:44:12
                </span>
                <p className="text-xs text-primary-dim">
                  <span className="font-medium">[Generador]</span> Commencing document synthesis...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container p-6 rounded-lg border border-outline-variant/10">
            <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">
              Lead Profile
            </h4>
            <div className="space-y-6">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded bg-surface-container-highest flex items-center justify-center overflow-hidden">
                   <div className="w-full h-full bg-primary flex items-center justify-center text-on-primary font-bold">V</div>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Vortex Global</p>
                  <p className="text-xs text-on-surface-variant">London, UK</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-3 rounded">
                  <p className="text-[10px] text-on-surface-variant uppercase mb-1">Score</p>
                  <p className="text-lg font-bold text-tertiary">9.8<span className="text-[10px] text-on-surface-variant/50 ml-1">/10</span></p>
                </div>
                <div className="bg-surface-container-low p-3 rounded">
                  <p className="text-[10px] text-on-surface-variant uppercase mb-1">Probability</p>
                  <p className="text-lg font-bold text-primary">82%</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-surface-container-highest to-surface-container p-6 rounded-lg border border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">
              Pipeline Intelligence
            </h4>
            <p className="text-xs text-on-surface leading-relaxed mb-6">
              Manual intervention is currently NOT recommended for this process.
            </p>
            <button className="w-full text-primary border border-primary/30 py-2 text-xs font-bold hover:bg-primary/5 transition-all rounded uppercase">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
