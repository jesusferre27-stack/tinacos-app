import { supabaseAdmin } from "../lib/supabase";

function EventStateBadge({ estado }) {
  const styles = {
    ok: "bg-tertiary/10 text-tertiary",
    error: "bg-error/10 text-error",
    pendiente: "bg-surface-container-highest text-on-surface text-opacity-70",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
        styles[estado] || styles["pendiente"]
      }`}
    >
      {estado || "DESCONOCIDO"}
    </span>
  );
}

function getAgentIcon(agentName) {
  const map = {
    filtrador: "filter_alt",
    generador: "description",
    enviador: "send",
    rutero: "route",
    extractor: "download",
  };
  return map[agentName?.toLowerCase()] || "settings";
}

export default async function Dashboard() {
  let metrics = null;
  let metricsError = null;
  let logs = [];
  let logsError = null;

  if (supabaseAdmin) {
    try {
      const { data: m, error: me } = await supabaseAdmin
        .from("tinacos_dashboard")
        .select("*")
        .single();
      metrics = m;
      metricsError = me;

      const { data: l, error: le } = await supabaseAdmin
        .from("tinacos_agentes_log")
        .select("*, tinacos_leads(folio)")
        .order("created_at", { ascending: false })
        .limit(10);
      logs = l || [];
      logsError = le;
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
      metricsError = e;
    }
  } else {
    metricsError = { message: "Supabase no está configurado (variables de entorno faltantes)." };
  }

  const data = metrics || {
    leads_nuevos: 0,
    datos_incompletos: 0,
    leads_completos: 0,
    pendientes_confirmacion: 0,
    confirmados: 0,
    entregados: 0,
    tinacos_confirmados: 0,
    rutas_planificadas: 0,
    rutas_en_curso: 0,
  };

  const totalLeads =
    data.leads_nuevos + data.datos_incompletos + data.leads_completos;
  const apartadosTotal =
    data.pendientes_confirmacion + data.confirmados + data.entregados;

  const conversionRate =
    totalLeads > 0 ? Math.round((apartadosTotal / totalLeads) * 100) : 0;

  return (
    <div className="p-4 md:p-8 space-y-6 pb-32 overflow-x-hidden">
      {(metricsError || logsError) && (
        <div className="bg-error-container/20 border border-error p-4 rounded-xl text-error text-sm">
          <strong>Error conectando a DB:</strong>{" "}
          {metricsError?.message || logsError?.message}
        </div>
      )}

      {/* Metric KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* Extractor */}
        <div className="bg-surface-container-highest p-4 rounded relative overflow-hidden group hover:bg-surface-bright transition-colors">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-primary"></div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">
              Extractor
            </span>
            <span className="material-symbols-outlined text-primary text-lg">
              download
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-on-surface" suppressHydrationWarning>
              {totalLeads.toLocaleString()}
            </h2>
            <span className="text-[10px] text-tertiary">Live</span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1">
            Nuevos Leads Detectados
          </p>
        </div>
        {/* Filtrador */}
        <div className="bg-surface-container-highest p-4 rounded relative overflow-hidden group hover:bg-surface-bright transition-colors">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-tertiary"></div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">
              Filtrador
            </span>
            <span className="material-symbols-outlined text-tertiary text-lg">
              filter_alt
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-on-surface">
              {conversionRate}%
            </h2>
            <span className="text-[10px] text-tertiary">Clean</span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1">
            {data.datos_incompletos} Pendientes
          </p>
        </div>
        {/* Generador */}
        <div className="bg-surface-container-highest p-4 rounded relative overflow-hidden group hover:bg-surface-bright transition-colors">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-primary"></div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">
              Generador
            </span>
            <span className="material-symbols-outlined text-primary text-lg">
              description
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-on-surface" suppressHydrationWarning>
              {apartadosTotal.toLocaleString()}
            </h2>
            <span className="text-[10px] text-on-surface-variant">Apartados</span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1">
            Revisión automática
          </p>
        </div>
        {/* Enviador */}
        <div className="bg-surface-container-highest p-4 rounded relative overflow-hidden group hover:bg-surface-bright transition-colors">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-tertiary"></div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">
              Enviador
            </span>
            <span className="material-symbols-outlined text-tertiary text-lg">
              send
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-on-surface">
              {data.tinacos_confirmados.toLocaleString()}
            </h2>
            <span className="text-[10px] text-tertiary">En cola</span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1">
            WhatsApp API Stable
          </p>
        </div>
        {/* Rutero */}
        <div className="bg-surface-container-highest p-4 rounded relative overflow-hidden group hover:bg-surface-bright transition-colors">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-primary"></div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">
              Rutero
            </span>
            <span className="material-symbols-outlined text-primary text-lg">
              route
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold text-on-surface">
              {data.rutas_planificadas}
            </h2>
            <span className="text-[10px] text-on-surface-variant">Rutas</span>
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1">
            {data.rutas_en_curso} Vehículos en curso
          </p>
        </div>
      </section>

      {/* Horizontal Pipeline Visualization */}
      <section className="bg-surface-container p-4 md:p-6 rounded-lg border-l-4 border-primary shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-bold tracking-widest text-on-surface uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              analytics
            </span>
            Lead Orchestration Pipeline
          </h3>
          <div className="flex items-center gap-4 text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>{" "}
              Processing
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-outline-variant"></span>{" "}
              Idle
            </span>
          </div>
        </div>
        <div className="relative flex items-center justify-between px-4 md:px-10 overflow-x-auto pb-2">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-outline-variant/20 -translate-y-1/2"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-tertiary shadow-[0_0_8px_#9bffce]"></div>
            <span className="mt-2 text-[10px] font-bold text-on-surface tracking-tighter">
              EXTRACT
            </span>
            <span className="text-[9px] text-tertiary">
              {data.leads_nuevos} In Queue
            </span>
          </div>
          <div className="w-full h-0.5 bg-gradient-to-r from-tertiary to-outline-variant/20 mx-4"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-tertiary shadow-[0_0_8px_#9bffce]"></div>
            <span className="mt-2 text-[10px] font-bold text-on-surface tracking-tighter">
              FILTER
            </span>
            <span className="text-[9px] text-tertiary">Processing</span>
          </div>
          <div className="w-full h-0.5 bg-outline-variant/20 mx-4"></div>
          <div className="relative z-10 flex flex-col items-center opacity-50">
            <div className="w-4 h-4 rounded-full bg-outline-variant"></div>
            <span className="mt-2 text-[10px] font-bold text-on-surface tracking-tighter">
              GENERATE
            </span>
            <span className="text-[9px] text-on-surface-variant">Idle</span>
          </div>
          <div className="w-full h-0.5 bg-outline-variant/20 mx-4"></div>
          <div className="relative z-10 flex flex-col items-center opacity-50">
            <div className="w-4 h-4 rounded-full bg-outline-variant"></div>
            <span className="mt-2 text-[10px] font-bold text-on-surface tracking-tighter">
              SEND
            </span>
            <span className="text-[9px] text-on-surface-variant">Waiting</span>
          </div>
          <div className="w-full h-0.5 bg-outline-variant/20 mx-4"></div>
          <div className="relative z-10 flex flex-col items-center opacity-50">
            <div className="w-4 h-4 rounded-full bg-outline-variant"></div>
            <span className="mt-2 text-[10px] font-bold text-on-surface tracking-tighter">
              ROUTE
            </span>
            <span className="text-[9px] text-on-surface-variant">End Cycle</span>
          </div>
        </div>
      </section>

      {/* Bento Grid Widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Agent Logs: Live Feed */}
        <div className="col-span-1 xl:col-span-7 bg-surface-container rounded-lg flex flex-col overflow-hidden shadow-sm border border-outline-variant/10 min-w-0">
          <div className="p-4 bg-surface-container-high border-b border-outline-variant/10 flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">history</span>
              Live Agent Events
            </h4>
            <span className="text-[10px] bg-tertiary/10 text-tertiary px-2 py-0.5 rounded">
              LIVE DB
            </span>
          </div>
          <div className="flex-1 overflow-x-auto p-2">
             <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase text-on-surface-variant tracking-wider border-b border-outline-variant/10">
                  <th className="pb-2 font-medium">Agent</th>
                  <th className="pb-2 font-medium">Lead Ref</th>
                  <th className="pb-2 font-medium">Action</th>
                  <th className="pb-2 font-medium text-right">Status</th>
                  <th className="pb-2 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {logs && logs.length > 0 ? (
                  logs.map((log) => {
                    const relativeTime = new Date(log.created_at).toLocaleTimeString("en-US", {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    });
                    const iconName = getAgentIcon(log.agente);
                    return (
                      <tr key={log.id} className="group border-b border-outline-variant/5 hover:bg-surface-container-highest transition-colors">
                        <td className="py-3 px-1">
                           <div className="flex items-center gap-2">
                             <span className="material-symbols-outlined text-primary text-sm">
                               {iconName}
                             </span>
                             <span className="text-xs font-semibold uppercase text-on-surface">
                               {log.agente}
                             </span>
                           </div>
                        </td>
                        <td className="py-3 px-1 text-xs text-on-surface-variant font-mono">
                          {log.tinacos_leads?.folio || "N/A"}
                        </td>
                        <td className="py-3 px-1 text-xs text-on-surface">
                          {log.accion}
                        </td>
                        <td className="py-3 px-1 text-right">
                          <EventStateBadge estado={log.resultado} />
                        </td>
                        <td className="py-3 px-1 text-right">
                          <p className="text-[10px] font-mono text-tertiary">
                            {relativeTime}
                          </p>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-on-surface-variant text-xs italic">
                      No events in log...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filtrador Analytics (Static Demo for styling) */}
        <div className="col-span-1 xl:col-span-5 bg-surface-container rounded-lg flex flex-col overflow-hidden shadow-sm border border-outline-variant/10 min-w-0">
          <div className="p-4 bg-surface-container-high border-b border-outline-variant/10">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface">
              Filtrador Analytics
            </h4>
          </div>
          <div className="flex-1 p-4 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 bg-tertiary rounded-full"></span>
                <h5 className="text-[10px] font-bold text-on-surface-variant uppercase">
                  Valid Entries
                </h5>
              </div>
              <div className="space-y-2">
                <div className="bg-surface-container-low p-2 rounded flex items-center justify-between border border-tertiary/5">
                  <span className="text-[11px] text-on-surface">
                    juan.perez@example.com
                  </span>
                  <span className="material-symbols-outlined text-tertiary text-sm">
                    check_circle
                  </span>
                </div>
                <div className="bg-surface-container-low p-2 rounded flex items-center justify-between border border-tertiary/5">
                  <span className="text-[11px] text-on-surface">
                    m.garcia_logistics@biz.com
                  </span>
                  <span className="material-symbols-outlined text-tertiary text-sm">
                    check_circle
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 bg-error rounded-full"></span>
                <h5 className="text-[10px] font-bold text-on-surface-variant uppercase">
                  Flagged / Invalid
                </h5>
              </div>
              <div className="space-y-2">
                <div className="bg-error-container/20 p-2 rounded flex items-center justify-between border border-error/10">
                  <span className="text-[11px] text-on-surface-variant">
                    +57 000 000 0000
                  </span>
                  <span className="text-[9px] font-bold text-error uppercase">
                    Wrong Format
                  </span>
                </div>
                <div className="bg-error-container/20 p-2 rounded flex items-center justify-between border border-error/10">
                  <span className="text-[11px] text-on-surface-variant">
                    temp_mail_12@bot.net
                  </span>
                  <span className="text-[9px] font-bold text-error uppercase">
                    Bot Detected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-primary to-primary-container rounded-lg shadow-2xl shadow-primary/20 flex items-center justify-center group active:scale-95 transition-all outline-none">
        <span className="material-symbols-outlined text-on-primary text-2xl group-hover:rotate-12 transition-transform">
          add
        </span>
        <div className="absolute bottom-full right-0 mb-4 bg-surface-container-highest px-3 py-2 rounded text-[10px] font-bold text-primary border border-outline-variant/30 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none uppercase tracking-widest">
          Inject New Batch
        </div>
      </button>
    </div>
  );
}

