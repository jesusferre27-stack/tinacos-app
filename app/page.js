import { supabaseAdmin } from "../lib/supabase";

function EventStateBadge({ estado }) {
  const styles = {
    'ok': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'error': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'pendiente': 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[estado] || styles['pendiente']}`}>
      {estado ? estado.toUpperCase() : 'DESCONOCIDO'}
    </span>
  )
}

function getAgentIconAndColor(agentName) {
  const map = {
    'filtrador': { icon: '🤖', color: 'text-blue-400', label: 'Agente Filtrador' },
    'generador': { icon: '⚡', color: 'text-purple-400', label: 'Agente Generador' },
    'enviador': { icon: '📨', color: 'text-green-400', label: 'Agente Enviador' },
    'rutero': { icon: '🗺️', color: 'text-amber-400', label: 'Agente Rutero' },
    'extractor': { icon: '📥', color: 'text-indigo-400', label: 'Agente Extractor' }
  };
  return map[agentName?.toLowerCase()] || { icon: '🔧', color: 'text-neutral-400', label: agentName };
}

export default async function Dashboard() {
  // 1. Fetch metrics from DB View (one single row expected)
  const { data: metrics, error: metricsError } = await supabaseAdmin
    .from('tinacos_dashboard')
    .select('*')
    .single();

  // 2. Fetch the latest agent activity logs
  const { data: logs, error: logsError } = await supabaseAdmin
    .from('tinacos_agentes_log')
    .select('*, tinacos_leads(folio)')
    .order('created_at', { ascending: false })
    .limit(10);

  // Fallbacks in case database just initialized and has no rows yet (though view returns 0s always)
  const data = metrics || {
    leads_nuevos: 0,
    datos_incompletos: 0,
    leads_completos: 0,
    pendientes_confirmacion: 0,
    confirmados: 0,
    entregados: 0,
    tinacos_confirmados: 0,
    rutas_planificadas: 0,
    rutas_en_curso: 0
  };

  const totalLeads = data.leads_nuevos + data.datos_incompletos + data.leads_completos;
  const apartadosTotal = data.pendientes_confirmacion + data.confirmados + data.entregados;
  
  // To avoid NaN
  const conversionRate = totalLeads > 0 ? Math.round((apartadosTotal / totalLeads) * 100) : 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Tinacos App Dashboard
          </h1>
          <p className="text-neutral-400 mt-1">Conectado a Supabase — Métricas en Tiempo Real</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-medium text-emerald-400">Conexión DB Estable</span>
          </div>
        </div>
      </header>

      {/* ERROR ALERTS */}
      {(metricsError || logsError) && (
        <div className="bg-red-900/40 border border-red-500 p-4 rounded-xl mb-6 text-red-200 text-sm">
          <strong>Error conectando a DB:</strong> {metricsError?.message || logsError?.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <h3 className="text-neutral-400 text-sm font-medium mb-1">Leads Recibidos</h3>
          <p className="text-4xl font-semibold text-white">{totalLeads.toLocaleString()}</p>
          <span className="text-xs text-blue-400 font-medium bg-blue-400/10 px-2 py-1 rounded-full mt-3 inline-block">
            {data.leads_completos} completos
          </span>
        </div>
        
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <h3 className="text-neutral-400 text-sm font-medium mb-1">Apartados Generados</h3>
          <p className="text-4xl font-semibold text-white">{apartadosTotal.toLocaleString()}</p>
          <span className="text-xs text-emerald-400 font-medium bg-emerald-400/10 px-2 py-1 rounded-full mt-3 inline-block">
            {conversionRate}% conversión
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-purple-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <h3 className="text-neutral-400 text-sm font-medium mb-1">Tinacos Confirmados</h3>
          <p className="text-4xl font-semibold text-white">{data.tinacos_confirmados.toLocaleString()}</p>
          <span className="text-xs text-purple-400 font-medium bg-purple-400/10 px-2 py-1 rounded-full mt-3 inline-block">
            Listos para envío
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <h3 className="text-neutral-400 text-sm font-medium mb-1">Rutas Planificadas</h3>
          <p className="text-4xl font-semibold text-white">{data.rutas_planificadas.toLocaleString()}</p>
          <span className="text-xs text-amber-400 font-medium bg-amber-400/10 px-2 py-1 rounded-full mt-3 inline-block">
            {data.rutas_en_curso} en curso
          </span>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-neutral-800 flex justify-between items-center">
          <h2 className="text-lg font-medium text-white">Últimas Acciones de Agentes (Auditoría)</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-950/50 text-neutral-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Agente</th>
                <th className="px-6 py-4 font-medium">Acción</th>
                <th className="px-6 py-4 font-medium">Referencia Lead</th>
                <th className="px-6 py-4 font-medium">Resultado</th>
                <th className="px-6 py-4 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-sm">
               {logs && logs.length > 0 ? (
                 logs.map((log) => {
                   const config = getAgentIconAndColor(log.agente);
                   const relativeTime = new Date(log.created_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
                   return (
                     <tr key={log.id} className="hover:bg-neutral-800/50 transition-colors">
                       <td className={`px-6 py-4 font-medium ${config.color}`}>{config.icon} {config.label}</td>
                       <td className="px-6 py-4 text-neutral-300">{log.accion}</td>
                       <td className="px-6 py-4 text-neutral-400">{log.tinacos_leads?.folio || 'N/A'}</td>
                       <td className="px-6 py-4"><EventStateBadge estado={log.resultado} /></td>
                       <td className="px-6 py-4 text-neutral-500">{relativeTime}</td>
                     </tr>
                   );
                 })
               ) : (
                 <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-neutral-500 italic">
                      No hay actividad registrada en la auditoría de agentes aún.
                    </td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
