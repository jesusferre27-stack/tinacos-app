"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Inicialización segura del cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export default function Logistica() {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ completed: 0, total: 0 });

  useEffect(() => {
    async function loadData() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 1. Obtener las entregas del día (Rutas) - Usamos fecha fija para mañana según el plan
        const { data: entregas, error: e1 } = await supabase
          .from("tinacos_entregas")
          .select("*")
          .eq("fecha_entrega", "2026-04-03")
          .order("id");

        if (e1) throw e1;

        // 2. Obtener los detalles vinculados
        const { data: detalles, error: e2 } = await supabase
          .from("tinacos_entrega_detalle")
          .select(`
            *,
            apartado:tinacos_apartados(*)
          `)
          .order("orden_ruta");

        if (e2) throw e2;

        // 3. Agrupar por ruta
        const grouped = (entregas || []).map((route) => {
          const items = (detalles || [])
            .filter((d) => d.entrega_id === route.id)
            .map((d, i) => ({
              id: d.id,
              num: `STOP ${i + 1}`,
              name: d.apartado?.nombre_cliente || "Sin Nombre",
              address: d.apartado?.direccion || "Sin Dirección",
              window: "09:00 - 18:00",
              product: `Tinaco ${d.apartado?.capacidad_lts || "1100"}L`,
              tag: d.estado_entrega === "completado" ? "ENTREGADO" : "PENDIENTE",
              active: d.estado_entrega === "pendiente",
              completed: d.estado_entrega === "completado"
            }));

          return {
            group: (route.notas_ruta || route.municipio || "RUTA").toUpperCase(),
            items: items,
          };
        });

        const total = (detalles || []).length;
        const completed = (detalles || []).filter(d => d.estado_entrega === 'completado').length;

        setStops(grouped);
        setStats({ completed, total });
        setLoading(false);
      } catch (err) {
        console.error("Error cargando logistica:", err);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#001b3d] text-[#7bd0ff]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7bd0ff] mr-4" />
        <span className="font-bold tracking-widest uppercase">Cargando Hoja de Ruta...</span>
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#001b3d] text-white">
        Configuración de base de datos incompleta.
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row overflow-hidden bg-[#001b3d]" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Map View - Simulado para Veracruz Sur */}
      <section className="flex-1 relative h-64 md:h-auto overflow-hidden bg-[#001128]">
        {/* Mapa Real Google Maps — Formato de alta compatibilidad para Veracruz */}
        <iframe
          src="https://maps.google.com/maps?q=18.11,-94.48&hl=es&z=12&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          className="absolute inset-0 w-full h-full opacity-100"
          loading="lazy"
        ></iframe>

        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <div className="bg-[#00214c] px-4 py-2 rounded-lg border border-[#7bd0ff]/40 flex items-center gap-2 shadow-[0_0_25px_rgba(0,0,0,0.6)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9bffce] animate-pulse" />
            <span className="text-xs font-bold text-[#e1e2e6] tracking-widest uppercase">
              Live Terminal • Veracruz Sur
            </span>
          </div>
        </div>

        {/* Marcadores Estilo Dashboard Navegable */}
        {stops.map((g, idx) => (
          <div 
            key={g.group} 
            className="absolute transition-all duration-1000 z-10"
            style={{ 
              top: `${25 + (idx * 15)}%`, 
              left: `${35 + (idx * 10)}%` 
            }}
          >
            <div className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform">
              <div className="bg-[#006495] text-[#9bffce] px-3 py-1.5 rounded-full shadow-[0_0_20px_rgba(0,100,149,0.5)] text-[10px] font-bold mb-1 border border-[#7bd0ff]/30 backdrop-blur-sm">
                {g.group}
              </div>
              <span className="material-symbols-outlined text-[#7bd0ff] text-4xl drop-shadow-[0_0_15px_rgba(123,208,255,0.7)]">location_on</span>
            </div>
          </div>
        ))}

        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button className="w-10 h-10 bg-[#00214c] rounded-lg text-white shadow-lg flex items-center justify-center hover:bg-[#003163]">
            <span className="material-symbols-outlined">add</span>
          </button>
          <button className="w-10 h-10 bg-[#00214c] rounded-lg text-white shadow-lg flex items-center justify-center hover:bg-[#003163]">
            <span className="material-symbols-outlined">remove</span>
          </button>
          <button className="w-10 h-10 bg-[#006495] text-white rounded-lg shadow-lg flex items-center justify-center hover:bg-[#007cb8]">
            <span className="material-symbols-outlined">my_location</span>
          </button>
        </div>
      </section>

      {/* Stop List Panel */}
      <aside className="w-full md:w-[420px] bg-[#001b3d] border-l border-[#7bd0ff]/10 flex flex-col z-10 shadow-2xl">
        <div className="p-4 sm:p-6 border-b border-[#7bd0ff]/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#e1e2e6] tracking-tight uppercase">
                Ruta Activa (Sur Ver)
              </h2>
              <p className="text-[#a5abbf] text-xs sm:text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">today</span>
                Mañana, 3 de abril
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xl sm:text-2xl font-bold text-[#9bffce] leading-none">
                {stats.completed}/{stats.total}
              </p>
              <p className="text-[10px] font-bold text-[#a5abbf] uppercase tracking-widest mt-1">
                PARADAS
              </p>
            </div>
          </div>
          <div className="h-1.5 w-full bg-[#00214c] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#9bffce] shadow-[0_0_8px_rgba(155,255,206,0.5)] transition-all duration-1000"
              style={{ width: `${(stats.completed / (stats.total || 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6" style={{ maxHeight: "calc(100vh - 240px)" }}>
          {stops.length === 0 ? (
             <div className="text-center py-10 opacity-50 text-[#a5abbf]">No hay rutas vinculadas aún.</div>
          ) : stops.map((group) => (
            <div key={group.group} className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <span className="text-[10px] font-bold text-[#7bd0ff] uppercase tracking-[0.2em]">
                  {group.group}
                </span>
                <div className="h-px flex-1 bg-[#7bd0ff]/10" />
              </div>
              {group.items.map((stop) => (
                <div
                  key={stop.id || stop.name}
                  className={`rounded-xl p-4 border transition-all cursor-pointer ${
                    stop.completed 
                    ? 'bg-[#00214c]/40 border-transparent opacity-50' 
                    : stop.active 
                    ? 'bg-[#00214c] border-[#006495] border-l-4 shadow-lg scale-[1.02]'
                    : 'bg-[#001128] border-transparent hover:bg-[#00214c]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          stop.completed ? 'bg-[#e1e2e6]/10 text-[#a5abbf] border-transparent' : 'bg-[#006495]/20 text-[#7bd0ff] border-[#006495]/30'
                        }`}>
                          {stop.num}
                        </span>
                        <span className={`text-[10px] font-bold ${stop.completed ? 'text-[#a5abbf]' : 'text-[#9bffce]'}`}>
                          {stop.tag}
                        </span>
                      </div>
                      <h3 className="font-bold text-[#e1e2e6] leading-tight uppercase text-sm">
                        {stop.name}
                      </h3>
                      <p className="text-[11px] text-[#a5abbf] mt-1">{stop.address}</p>
                    </div>
                  </div>
                  {!stop.completed && (
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => {
                          const query = encodeURIComponent(`${stop.address}, ${group.group}, Veracruz, Mexico`);
                          window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                        }}
                        className="flex-1 bg-[#006495] py-2.5 rounded-lg text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-[#007cb8]"
                      >
                        <span className="material-symbols-outlined text-sm">directions</span>
                        ENTREGAR
                      </button>
                      <button className="px-3 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                        <span className="material-symbols-outlined text-sm">priority_high</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#001128] border-t border-[#7bd0ff]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00214c] flex items-center justify-center text-[#7bd0ff]">
              <span className="material-symbols-outlined text-3xl">local_shipping</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#a5abbf] uppercase tracking-wider mb-0.5">
                Punto Final
              </p>
              <p className="text-xs font-bold text-[#e1e2e6] uppercase">BODEGA COSO</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#00214c] p-3 rounded-lg text-[#7bd0ff] hover:text-[#9bffce] border border-[#7bd0ff]/10 transition-colors"
          >
             <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
