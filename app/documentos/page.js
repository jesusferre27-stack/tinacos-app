const docs = [
  { id: "BOL_88293", name: "BOL_88293_AMAZON.pdf", client: "Amazon Warehouse - Dist. Center", size: "1.2 MB", ago: "2m ago", status: "verified" },
  { id: "INV_90112", name: "INV_90112_TESLA.pdf", client: "Tesla Gigafactory - Logistics", size: "892 KB", ago: "15m ago", status: "verified" },
  { id: "SHIP_ERR", name: "SHIP_ERR_LOCAL.pdf", client: "Local Hub 04 - Dispatch", size: "0 KB", ago: "45m ago", status: "corrupted" },
  { id: "RT_5512", name: "RT_5512_SAMSUNG.pdf", client: "Samsung Electronics Co.", size: "1.8 MB", ago: "1h ago", status: "verified" },
  { id: "BOL_88301", name: "BOL_88301_AMAZON.pdf", client: "Amazon Fulfillment NY", size: "1.1 MB", ago: "1.5h ago", status: "verified" },
];

const messages = [
  { initials: "JP", name: "Juan Pérez", phone: "+52 81 1234 5678", preview: "Tu tinaco #BOL_88293 está en camino. Confirma tu disponibilidad.", time: "14:22:15", status: "read" },
  { initials: "MS", name: "María Silva", phone: "+52 81 9876 5432", preview: "Archivo de apartado INV_90112 enviado. Favor de confirmar recepción.", time: "14:18:02", status: "delivered" },
  { initials: "RT", name: "Roberto Tech", phone: "+52 81 5555 4444", preview: "Código de confirmación para tu pedido: 8829-XL. Expira en 5 min.", time: "14:10:45", status: "sent" },
  { initials: "AL", name: "Ana Logistics", phone: "+52 81 3333 2211", preview: "Nueva ruta asignada a TRUCK_992. Información adjunta para BOL_88301.", time: "13:55:21", status: "read" },
];

function StatusBadge({ status }) {
  const map = {
    verified: { label: "Verificado", cls: "text-on-tertiary-container bg-tertiary-container/30" },
    corrupted: { label: "Corrompido", cls: "text-on-error-container bg-error-container/30" },
  };
  const s = map[status] || map.verified;
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${s.cls}`}>
      {s.label}
    </span>
  );
}

function MsgStatus({ status }) {
  if (status === "read") return (
    <div className="flex items-center gap-1 text-tertiary">
      <span className="material-symbols-outlined text-lg">check_circle</span>
      <span className="text-[10px] font-bold uppercase">Leído</span>
    </div>
  );
  if (status === "delivered") return (
    <div className="flex items-center gap-1 text-on-surface-variant">
      <span className="material-symbols-outlined text-lg">done_all</span>
      <span className="text-[10px] font-bold uppercase">Entregado</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1 text-on-surface-variant/50">
      <span className="material-symbols-outlined text-lg">check</span>
      <span className="text-[10px] font-bold uppercase">Enviado</span>
    </div>
  );
}

export default function Documentos() {
  return (
    <div className="p-8 pb-32">
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-2">
            Communication Hub
          </h2>
          <p className="text-on-surface-variant text-sm max-w-md">
            Audita y monitorea la documentación generada y los canales de WhatsApp en tiempo real.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-surface-container-highest text-on-surface px-4 py-2 text-sm font-medium rounded-md border border-outline-variant/20 hover:bg-surface-bright transition-colors">
            Actualizar
          </button>
          <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-4 py-2 text-sm font-bold rounded-md active:scale-95 transition-transform">
            Nueva Auditoría
          </button>
        </div>
      </div>

      {/* Tab strip */}
      <div className="mb-8 bg-surface-container-low rounded-xl p-1 inline-flex">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-surface-container-highest text-primary font-semibold transition-all text-sm">
          <span className="material-symbols-outlined text-xl">description</span>
          Documentos (Generador)
        </button>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-on-surface-variant hover:text-on-surface font-medium transition-all text-sm">
          <span className="material-symbols-outlined text-xl">message</span>
          Mensajes (Enviador)
        </button>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar KPIs */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="bg-surface-container-highest p-5 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary" />
            <span className="text-on-surface-variant text-xs font-medium uppercase tracking-wider block mb-1">
              Archivos Generados
            </span>
            <div className="text-3xl font-bold text-primary">1,284</div>
            <div className="mt-3 flex items-center text-[10px] text-tertiary">
              <span className="material-symbols-outlined text-xs mr-1">trending_up</span>
              +12% desde ayer
            </div>
          </div>
          <div className="bg-surface-container-highest p-5 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-tertiary" />
            <span className="text-on-surface-variant text-xs font-medium uppercase tracking-wider block mb-1">
              Entrega de Mensajes
            </span>
            <div className="text-3xl font-bold text-tertiary">98.2%</div>
            <div className="mt-3 flex items-center text-[10px] text-tertiary">
              <span className="material-symbols-outlined text-xs mr-1">check_circle</span>
              Gateway Activo
            </div>
          </div>
          <div className="bg-surface-container p-5 rounded-lg border border-outline-variant/10">
            <h4 className="text-xs font-bold text-on-surface-variant mb-4 uppercase tracking-widest">
              Filtros Activos
            </h4>
            <div className="space-y-2">
              {["PDFs / Apartados", "Notas de Despacho", "Logs de Error"].map((label, i) => (
                <label
                  key={label}
                  className="flex items-center gap-3 text-xs text-on-surface/80 bg-surface-container-low px-3 py-2 rounded border border-outline-variant/5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    defaultChecked={i < 2}
                    className="rounded-sm bg-surface-dim border-outline-variant text-primary focus:ring-0"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Documents grid */}
        <div className="col-span-12 lg:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="bg-surface-container rounded-lg p-5 flex flex-col hover:bg-surface-bright transition-colors border border-outline-variant/5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg ${doc.status === "corrupted" ? "bg-error/10" : "bg-primary/10"}`}>
                    <span className={`material-symbols-outlined text-3xl ${doc.status === "corrupted" ? "text-error" : "text-primary"}`}>
                      picture_as_pdf
                    </span>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
                <h3 className="text-on-surface font-semibold text-sm mb-1 truncate">{doc.name}</h3>
                <p className="text-on-surface-variant text-xs mb-6">{doc.client}</p>
                <div className="mt-auto pt-4 border-t border-outline-variant/10 flex items-center justify-between">
                  <span className="text-[10px] text-on-surface-variant font-mono">
                    {doc.size} • {doc.ago}
                  </span>
                  <button className={`transition-colors ${doc.status === "corrupted" ? "text-error hover:text-error-dim" : "text-primary hover:text-primary-dim"}`}>
                    <span className="material-symbols-outlined">
                      {doc.status === "corrupted" ? "refresh" : "download"}
                    </span>
                  </button>
                </div>
              </div>
            ))}
            {/* Upload placeholder */}
            <div className="border-2 border-dashed border-outline-variant/20 rounded-lg p-5 flex flex-col items-center justify-center text-on-surface-variant hover:border-primary/50 transition-all cursor-pointer bg-surface-container/20 min-h-[180px]">
              <span className="material-symbols-outlined text-3xl mb-2">add_circle</span>
              <span className="text-xs font-medium uppercase tracking-widest">Subida Manual</span>
            </div>
          </div>

          {/* WhatsApp Feed */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">chat_bubble</span>
                Logs de Entrega (WhatsApp)
              </h3>
              <span className="text-xs text-tertiary flex items-center gap-1">
                <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                Feed en Vivo
              </span>
            </div>
            <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-highest/50">
                  <tr>
                    {["Destinatario", "Vista Previa", "Hora", "Estado"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {messages.map((m) => (
                    <tr
                      key={m.initials + m.time}
                      className="hover:bg-surface-container-highest/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-xs text-primary font-bold">
                            {m.initials}
                          </div>
                          <div className="text-sm">
                            {m.name}
                            <span className="text-xs text-on-surface-variant/60 block">{m.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-on-surface/80 line-clamp-1 max-w-xs">
                          {m.preview}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-mono text-on-surface-variant">
                        {m.time}
                      </td>
                      <td className="px-6 py-4">
                        <MsgStatus status={m.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
