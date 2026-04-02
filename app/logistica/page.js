export default function Logistica() {
  const stops = [
    {
      group: "Monterrey Centro",
      items: [
        {
          num: "STOP 15",
          name: "Residencial Las Torres",
          address: "Juan O'Gorman #1204",
          window: "14:00 - 16:00",
          product: "Tinaco Vertical 1100L",
          tag: "NEXT UP",
          active: true,
        },
        {
          num: "STOP 16",
          name: "Condominios Acero",
          address: "Av. Constitución #500",
          window: "16:30 - 18:00",
          active: false,
        },
      ],
    },
    {
      group: "San Pedro Garza García",
      items: [
        {
          num: "STOP 17",
          name: "Valle Oriente II",
          address: "Río Mississippi #405",
          window: "18:15 - 19:30",
          active: false,
        },
        {
          num: "STOP 18",
          name: "Plaza Fiesta Agustín",
          address: "Av. Real San Agustín #100",
          window: "19:45 - 21:00",
          active: false,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col md:flex-row overflow-hidden" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Map View */}
      <section className="flex-1 relative h-64 md:h-auto bg-surface-container-lowest overflow-hidden">
        {/* Map background placeholder */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(#2b4680 0 1px, transparent 1px 100%), repeating-linear-gradient(90deg, #2b4680 0 1px, transparent 1px 100%)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-container-low opacity-80" />

        {/* Live tracking badge */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-surface-container-highest/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-outline-variant/20 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="text-[10px] font-bold text-on-surface tracking-wider uppercase">
              Live Route Tracking
            </span>
          </div>
        </div>

        {/* Decorative map pins */}
        <div className="absolute top-1/4 left-1/3 group cursor-pointer">
          <div className="flex flex-col items-center">
            <div className="bg-primary text-on-primary px-2 py-1 rounded shadow-lg text-[10px] font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
              STOP 15
            </div>
            <span className="material-symbols-outlined text-primary text-3xl">
              location_on
            </span>
          </div>
        </div>
        <div className="absolute top-2/3 right-1/4 group cursor-pointer">
          <div className="flex flex-col items-center">
            <div className="bg-tertiary text-on-tertiary px-2 py-1 rounded shadow-lg text-[10px] font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
              STOP 17
            </div>
            <span className="material-symbols-outlined text-tertiary text-3xl">
              location_on
            </span>
          </div>
        </div>

        {/* Vehicle ping */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-primary border-2 border-on-surface shadow-[0_0_10px_#7bd0ff]" />
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          </div>
        </div>

        {/* Map controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button className="w-10 h-10 bg-surface-container-highest rounded-lg flex items-center justify-center text-on-surface shadow-lg hover:bg-surface-bright transition-colors">
            <span className="material-symbols-outlined">add</span>
          </button>
          <button className="w-10 h-10 bg-surface-container-highest rounded-lg flex items-center justify-center text-on-surface shadow-lg hover:bg-surface-bright transition-colors">
            <span className="material-symbols-outlined">remove</span>
          </button>
          <button className="w-10 h-10 bg-primary text-on-primary rounded-lg flex items-center justify-center shadow-lg hover:bg-primary-dim transition-colors">
            <span className="material-symbols-outlined">my_location</span>
          </button>
        </div>
      </section>

      {/* Stop List Panel */}
      <aside className="w-full md:w-[420px] bg-surface-container border-l border-outline-variant/15 flex flex-col z-10 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xl font-bold text-on-surface tracking-tight">
                Ruta Activa
              </h2>
              <p className="text-on-surface-variant text-sm flex items-center gap-1" suppressHydrationWarning>
                <span className="material-symbols-outlined text-xs">today</span>
                Hoy, {new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long" })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-tertiary">14/22</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Paradas Completadas
              </p>
            </div>
          </div>
          {/* Progress */}
          <div className="h-1 w-full bg-outline-variant/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-tertiary shadow-[0_0_8px_rgba(155,255,206,0.5)]"
              style={{ width: "63%" }}
            />
          </div>
        </div>

        {/* Scrollable stops feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6" style={{ maxHeight: "calc(100vh - 240px)" }}>
          {stops.map((group) => (
            <div key={group.group} className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                  {group.group}
                </span>
                <div className="h-px flex-1 bg-outline-variant/20" />
              </div>
              {group.items.map((stop) =>
                stop.active ? (
                  <div
                    key={stop.num}
                    className="bg-surface-container-highest rounded-xl p-4 border-l-4 border-primary shadow-sm hover:bg-surface-bright transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold border border-primary/20">
                            {stop.num}
                          </span>
                          {stop.tag && (
                            <span className="text-[10px] font-bold text-tertiary">
                              {stop.tag}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-on-surface leading-tight">
                          {stop.name}
                        </h3>
                        <p className="text-xs text-on-surface-variant">{stop.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-on-surface">{stop.window}</p>
                        <p className="text-[10px] text-on-surface-variant">Delivery Window</p>
                      </div>
                    </div>
                    {stop.product && (
                      <div className="bg-surface-container-low rounded-lg p-3 mb-4 flex items-center justify-between border border-outline-variant/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-outline-variant/20 rounded flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary-dim">
                              water_drop
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-on-surface">{stop.product}</p>
                            <p className="text-[10px] text-on-surface-variant">Negro / Multi-capa</p>
                          </div>
                        </div>
                        <button className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest hover:text-primary transition-colors">
                          <span className="material-symbols-outlined">phone</span>
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button className="flex-1 bg-gradient-to-br from-primary to-primary-container py-3 rounded-lg text-on-primary text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Entregado
                      </button>
                      <button className="px-4 border border-outline-variant/30 rounded-lg text-error text-xs font-bold uppercase hover:bg-error/10 transition-colors">
                        Problema
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={stop.num}
                    className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10 hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-outline-variant/20 text-on-surface-variant px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {stop.num}
                          </span>
                        </div>
                        <h3 className="font-bold text-on-surface leading-tight">{stop.name}</h3>
                        <p className="text-xs text-on-surface-variant">{stop.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-on-surface-variant">{stop.window}</p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          ))}
        </div>

        {/* Bottom Action Bar */}
        <div className="p-4 bg-surface-container-highest border-t border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">route</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Punto Final
              </p>
              <p className="text-xs font-bold text-on-surface">Bodega Principal Norte</p>
            </div>
          </div>
          <button className="bg-surface-container-low p-3 rounded-lg text-on-surface hover:text-tertiary transition-colors border border-outline-variant/20">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
