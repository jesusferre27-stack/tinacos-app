import { useState, useEffect, useCallback } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

// ── CONFIG ─────────────────────────────────────────────────
const SUPABASE_URL = "https://mcwlpopucpxfjdawxlgk.supabase.co"
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jd2xwb3B1Y3B4ZmpkYXd4bGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMDAwMDAsImV4cCI6MjA1NzU3NjAwMH0.placeholder"

// ── MOCK DATA (se reemplaza con Supabase real) ─────────────
const MOCK = {
  dashboard: {
    leads_nuevos: 12,
    datos_incompletos: 8,
    leads_completos: 34,
    pendientes_confirmacion: 18,
    confirmados: 47,
    entregados: 31,
    tinacos_confirmados: 52,
    rutas_planificadas: 3,
    rutas_en_curso: 1,
  },
  leads: [
    { id: 1, folio: "TIN-2026-0045", nombre: "María Hernández", telefono: "9221234567", municipio: "Coatzacoalcos", cantidad: 1, estado: "confirmado", tipo_entrega: "domicilio", created_at: "2026-03-31T10:22:00" },
    { id: 2, folio: "TIN-2026-0046", nombre: "Carlos Ramírez", telefono: "9229876543", municipio: "Acayucan", cantidad: 2, estado: "pendiente_confirmacion", tipo_entrega: "domicilio", created_at: "2026-03-31T10:45:00" },
    { id: 3, folio: "TIN-2026-0047", nombre: "Ana López", telefono: "9224567890", municipio: "Minatitlán", cantidad: 1, estado: "completo", tipo_entrega: "punto_recoleccion", created_at: "2026-03-31T11:00:00" },
    { id: 4, folio: "TIN-2026-0048", nombre: "(Sin nombre)", telefono: "9223456789", municipio: "Coatzacoalcos", cantidad: 1, estado: "datos_incompletos", tipo_entrega: "domicilio", created_at: "2026-03-31T11:15:00" },
    { id: 5, folio: "TIN-2026-0049", nombre: "Pedro García", telefono: "9221112233", municipio: "Cosoleacaque", cantidad: 1, estado: "confirmado", tipo_entrega: "domicilio", created_at: "2026-03-31T11:30:00" },
  ],
  logs: [
    { id: 1, agente: "filtrador", accion: "nuevo_lead", resultado: "ok", detalle: { folio: "TIN-2026-0049", municipio: "Cosoleacaque" }, created_at: "2026-03-31T11:30:05" },
    { id: 2, agente: "generador", accion: "comprobante_generado", resultado: "ok", detalle: { folio_apartado: "APT-2026-0049", cliente: "Pedro García" }, created_at: "2026-03-31T11:30:08" },
    { id: 3, agente: "enviador", accion: "comprobante_enviado", resultado: "ok", detalle: { folio: "APT-2026-0049", telefono: "9221112233" }, created_at: "2026-03-31T11:30:12" },
    { id: 4, agente: "enviador", accion: "confirmacion_recibida", resultado: "ok", detalle: { folio: "APT-2026-0049", confirmado: true }, created_at: "2026-03-31T11:45:00" },
    { id: 5, agente: "rutero", accion: "ruta_generada", resultado: "ok", detalle: { municipio: "Cosoleacaque", total_tinacos: 4 }, created_at: "2026-03-31T11:45:03" },
    { id: 6, agente: "filtrador", accion: "nuevo_lead", resultado: "ok", detalle: { folio: "TIN-2026-0048", municipio: "Coatzacoalcos" }, created_at: "2026-03-31T11:15:02" },
    { id: 7, agente: "filtrador", accion: "nuevo_lead", resultado: "error", detalle: { error: "telefono inválido" }, created_at: "2026-03-31T10:58:00" },
  ],
  municipios: [
    { municipio: "Coatzacoalcos", tinacos: 22 },
    { municipio: "Acayucan", tinacos: 9 },
    { municipio: "Minatitlán", tinacos: 7 },
    { municipio: "Cosoleacaque", tinacos: 5 },
    { municipio: "Jaltipán", tinacos: 3 },
    { municipio: "Otros", tinacos: 6 },
  ]
}

const AGENT_COLORS = {
  filtrador: "#3B82F6",
  generador: "#8B5CF6",
  enviador: "#10B981",
  rutero: "#F59E0B",
  extractor: "#EC4899",
}

const ESTADO_CONFIG = {
  nuevo:                  { label: "Nuevo",           color: "#6B7280", bg: "#1F2937" },
  datos_incompletos:      { label: "Incompleto",      color: "#F59E0B", bg: "#451A03" },
  completo:               { label: "Completo",        color: "#3B82F6", bg: "#1E3A5F" },
  apartado:               { label: "Apartado",        color: "#8B5CF6", bg: "#2D1B69" },
  pendiente_confirmacion: { label: "Pend. confirm.",  color: "#F97316", bg: "#431407" },
  confirmado:             { label: "Confirmado",      color: "#10B981", bg: "#064E3B" },
  listo_entrega:          { label: "Listo entrega",   color: "#06B6D4", bg: "#0C4A6E" },
  entregado:              { label: "Entregado",       color: "#22C55E", bg: "#14532D" },
  cancelado:              { label: "Cancelado",       color: "#EF4444", bg: "#450A0A" },
}

function Badge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || { label: estado, color: "#9CA3AF", bg: "#1F2937" }
  return (
    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
      {cfg.label}
    </span>
  )
}

function AgentBadge({ agente }) {
  const color = AGENT_COLORS[agente] || "#9CA3AF"
  return (
    <span style={{ background: color + "20", color, border: `1px solid ${color}40`, borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
      {agente}
    </span>
  )
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: "#111827", border: "1px solid #1F2937", borderRadius: 10, padding: "16px 18px", flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: accent || "#F9FAFB", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: accent || "#9CA3AF", marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

export default function Dashboard() {
  const [tab, setTab] = useState("pipeline")
  const [data, setData] = useState(MOCK)
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [supabaseKey, setSupabaseKey] = useState("")
  const [connected, setConnected] = useState(false)

  const fetchData = useCallback(async () => {
    if (!connected || !supabaseKey) return
    setLoading(true)
    try {
      const headers = { "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}`, "Content-Type": "application/json" }
      const [dashRes, leadsRes, logsRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/tinacos_dashboard`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/tinacos_leads?select=id,folio,nombre,telefono,municipio,cantidad,estado,tipo_entrega,created_at&order=created_at.desc&limit=50`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/tinacos_agentes_log?select=*&order=created_at.desc&limit=30`, { headers }),
      ])
      const [dash, leads, logs] = await Promise.all([dashRes.json(), leadsRes.json(), logsRes.json()])
      setData(prev => ({ ...prev, dashboard: dash[0] || prev.dashboard, leads: leads || prev.leads, logs: logs || prev.logs }))
      setLastRefresh(new Date())
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [connected, supabaseKey])

  useEffect(() => {
    if (connected) {
      fetchData()
      const interval = setInterval(fetchData, 30000)
      return () => clearInterval(interval)
    }
  }, [connected, fetchData])

  const d = data.dashboard

  const tabs = [
    { id: "pipeline", label: "Pipeline" },
    { id: "logs", label: "Logs Agentes" },
    { id: "rutas", label: "Rutas" },
    { id: "stats", label: "Estadísticas" },
  ]

  return (
    <div style={{ background: "#030712", minHeight: "100vh", color: "#F9FAFB", fontFamily: "'IBM Plex Mono', 'Fira Code', monospace", padding: 0 }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(90deg, #0F172A 0%, #0D4A8B20 100%)", borderBottom: "1px solid #1F2937", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 22 }}>🪣</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#F9FAFB", letterSpacing: 0.5 }}>ALIANZA COMUNITARIA</div>
            <div style={{ fontSize: 9, color: "#0D4A8B", letterSpacing: 3, textTransform: "uppercase", fontWeight: 600 }}>Sistema de Agentes · Tinacos 2026</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 10, color: "#4B5563" }}>
            {connected ? `● Conectado · ${lastRefresh.toLocaleTimeString("es-MX")}` : "○ Demo mode"}
          </div>
          {!connected && (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                placeholder="Supabase anon key..."
                value={supabaseKey}
                onChange={e => setSupabaseKey(e.target.value)}
                style={{ background: "#111827", border: "1px solid #374151", borderRadius: 6, color: "#9CA3AF", padding: "4px 8px", fontSize: 10, width: 180, outline: "none" }}
              />
              <button
                onClick={() => setConnected(true)}
                style={{ background: "#0D4A8B", border: "none", color: "#fff", padding: "4px 12px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer" }}
              >
                Conectar
              </button>
            </div>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            style={{ background: "#1F2937", border: "1px solid #374151", color: "#9CA3AF", padding: "4px 10px", borderRadius: 6, fontSize: 10, cursor: "pointer" }}
          >
            {loading ? "⟳ cargando..." : "⟳ refresh"}
          </button>
        </div>
      </div>

      {/* KPI ROW */}
      <div style={{ padding: "16px 24px", display: "flex", gap: 10, flexWrap: "wrap", borderBottom: "1px solid #0F172A" }}>
        <StatCard label="Leads nuevos"        value={d.leads_nuevos}             accent="#6B7280" />
        <StatCard label="Incompletos"          value={d.datos_incompletos}        accent="#F59E0B" />
        <StatCard label="Completos"            value={d.leads_completos}          accent="#3B82F6" />
        <StatCard label="Pend. confirmación"   value={d.pendientes_confirmacion}  accent="#F97316" />
        <StatCard label="Confirmados"          value={d.confirmados}              accent="#10B981" />
        <StatCard label="Entregados"           value={d.entregados}               accent="#22C55E" />
        <StatCard label="Tinacos confirmados"  value={d.tinacos_confirmados}      accent="#F5B800" sub="unidades" />
        <StatCard label="Rutas planificadas"   value={d.rutas_planificadas}       accent="#06B6D4" />
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1F2937", padding: "0 24px" }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "none", border: "none", padding: "12px 20px", fontSize: 12, fontWeight: 600,
              color: tab === t.id ? "#F9FAFB" : "#4B5563",
              borderBottom: tab === t.id ? "2px solid #0D4A8B" : "2px solid transparent",
              cursor: "pointer", fontFamily: "inherit", letterSpacing: 0.5
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{ padding: "20px 24px" }}>

        {/* PIPELINE */}
        {tab === "pipeline" && (
          <div>
            <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 11, color: "#4B5563" }}>Últimos {data.leads.length} leads · orden cronológico inverso</div>
            </div>
            <div style={{ border: "1px solid #1F2937", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#0F172A" }}>
                    {["Folio", "Cliente", "Teléfono", "Municipio", "Cant.", "Entrega", "Estado", "Hora"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#4B5563", fontWeight: 600, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", borderBottom: "1px solid #1F2937" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.leads.map((lead, i) => (
                    <tr key={lead.id} style={{ background: i % 2 === 0 ? "#030712" : "#050B18", borderBottom: "1px solid #0F172A" }}>
                      <td style={{ padding: "10px 14px", color: "#F5B800", fontWeight: 700 }}>{lead.folio}</td>
                      <td style={{ padding: "10px 14px", color: "#F9FAFB" }}>{lead.nombre || "(sin nombre)"}</td>
                      <td style={{ padding: "10px 14px", color: "#9CA3AF" }}>{lead.telefono}</td>
                      <td style={{ padding: "10px 14px", color: "#9CA3AF" }}>{lead.municipio}</td>
                      <td style={{ padding: "10px 14px", color: "#F9FAFB", textAlign: "center", fontWeight: 700 }}>{lead.cantidad}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ color: lead.tipo_entrega === "domicilio" ? "#06B6D4" : "#F59E0B", fontSize: 10 }}>
                          {lead.tipo_entrega === "domicilio" ? "🏠 Dom." : "📍 Punto"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <Badge estado={lead.estado} />
                      </td>
                      <td style={{ padding: "10px 14px", color: "#4B5563", fontSize: 10 }}>{formatTime(lead.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LOGS */}
        {tab === "logs" && (
          <div>
            <div style={{ marginBottom: 14, fontSize: 11, color: "#4B5563" }}>
              Últimos {data.logs.length} eventos de agentes
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {data.logs.map((log, i) => (
                <div key={log.id || i} style={{
                  background: log.resultado === "error" ? "#1C0A0A" : "#0A0F1E",
                  border: `1px solid ${log.resultado === "error" ? "#7F1D1D" : "#1F2937"}`,
                  borderLeft: `3px solid ${log.resultado === "error" ? "#EF4444" : (AGENT_COLORS[log.agente] || "#374151")}`,
                  borderRadius: 6, padding: "10px 14px",
                  display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap"
                }}>
                  <span style={{ fontSize: 10, color: "#4B5563", minWidth: 60 }}>{formatTime(log.created_at)}</span>
                  <AgentBadge agente={log.agente} />
                  <span style={{ fontSize: 12, color: "#D1D5DB", flex: 1 }}>{log.accion.replace(/_/g, " ")}</span>
                  <span style={{ fontSize: 10, color: log.resultado === "error" ? "#EF4444" : "#10B981", fontWeight: 700 }}>
                    {log.resultado === "error" ? "✗ ERROR" : "✓ OK"}
                  </span>
                  <span style={{ fontSize: 10, color: "#4B5563", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {JSON.stringify(log.detalle)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RUTAS */}
        {tab === "rutas" && (
          <div>
            <div style={{ marginBottom: 14, fontSize: 11, color: "#4B5563" }}>
              Rutas generadas por municipio — click en el enlace para abrir Google Maps
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
              {[
                { municipio: "Coatzacoalcos", clientes: 22, tinacos: 22, domicilios: 18, puntos: 4, estado: "en_ruta", folio: "ENT-2026-0001" },
                { municipio: "Acayucan", clientes: 6, tinacos: 7, domicilios: 5, puntos: 1, estado: "planificada", folio: "ENT-2026-0002" },
                { municipio: "Minatitlán", clientes: 6, tinacos: 6, domicilios: 3, puntos: 3, estado: "planificada", folio: "ENT-2026-0003" },
              ].map(ruta => (
                <div key={ruta.municipio} style={{ background: "#0A0F1E", border: "1px solid #1F2937", borderRadius: 10, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#F9FAFB" }}>{ruta.municipio}</div>
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: "3px 8px", borderRadius: 4,
                      background: ruta.estado === "en_ruta" ? "#064E3B" : "#1E3A5F",
                      color: ruta.estado === "en_ruta" ? "#10B981" : "#3B82F6",
                      border: `1px solid ${ruta.estado === "en_ruta" ? "#10B981" : "#3B82F6"}40`
                    }}>
                      {ruta.estado === "en_ruta" ? "🚚 EN RUTA" : "📋 PLANIFICADA"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                    <div><div style={{ fontSize: 20, fontWeight: 800, color: "#F5B800" }}>{ruta.tinacos}</div><div style={{ fontSize: 9, color: "#4B5563" }}>tinacos</div></div>
                    <div><div style={{ fontSize: 20, fontWeight: 800, color: "#F9FAFB" }}>{ruta.clientes}</div><div style={{ fontSize: 9, color: "#4B5563" }}>clientes</div></div>
                    <div><div style={{ fontSize: 20, fontWeight: 800, color: "#06B6D4" }}>{ruta.domicilios}</div><div style={{ fontSize: 9, color: "#4B5563" }}>dom.</div></div>
                    <div><div style={{ fontSize: 20, fontWeight: 800, color: "#F59E0B" }}>{ruta.puntos}</div><div style={{ fontSize: 9, color: "#4B5563" }}>puntos</div></div>
                  </div>
                  <div style={{ fontSize: 10, color: "#4B5563", marginBottom: 10 }}>Folio: {ruta.folio}</div>
                  <a
                    href={`https://www.google.com/maps/search/${ruta.municipio}+Veracruz`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", textAlign: "center", background: "#0D4A8B", color: "#fff", padding: "8px", borderRadius: 6, fontSize: 11, fontWeight: 700, textDecoration: "none" }}
                  >
                    🗺 Abrir ruta en Google Maps
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATS */}
        {tab === "stats" && (
          <div>
            <div style={{ marginBottom: 16, fontSize: 11, color: "#4B5563" }}>Tinacos confirmados por municipio</div>
            <div style={{ background: "#0A0F1E", border: "1px solid #1F2937", borderRadius: 10, padding: "20px 16px" }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.municipios} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                  <XAxis dataKey="municipio" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={{ stroke: "#1F2937" }} tickLine={false} />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, color: "#F9FAFB", fontSize: 12 }}
                    cursor={{ fill: "#1F2937" }}
                  />
                  <Bar dataKey="tinacos" radius={[4, 4, 0, 0]}>
                    {data.municipios.map((_, i) => (
                      <Cell key={i} fill={["#0D4A8B", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"][i % 6]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
              {Object.entries(AGENT_COLORS).map(([agente, color]) => {
                const count = data.logs.filter(l => l.agente === agente).length
                const errors = data.logs.filter(l => l.agente === agente && l.resultado === "error").length
                return (
                  <div key={agente} style={{ background: "#0A0F1E", border: `1px solid ${color}30`, borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{agente}</div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div><div style={{ fontSize: 22, fontWeight: 800, color: "#F9FAFB" }}>{count}</div><div style={{ fontSize: 9, color: "#4B5563" }}>eventos</div></div>
                      <div><div style={{ fontSize: 22, fontWeight: 800, color: errors > 0 ? "#EF4444" : "#10B981" }}>{errors}</div><div style={{ fontSize: 9, color: "#4B5563" }}>errores</div></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div style={{ padding: "12px 24px", borderTop: "1px solid #0F172A", fontSize: 9, color: "#1F2937", display: "flex", justifyContent: "space-between" }}>
        <span>Alianza Comunitaria para el Desarrollo · Chinameca, Veracruz</span>
        <span>Para conectar datos reales: ingresa tu Supabase anon key arriba</span>
      </div>
    </div>
  )
}
