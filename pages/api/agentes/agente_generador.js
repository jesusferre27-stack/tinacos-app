// ============================================================
// AGENTE 3 — GENERADOR DE COMPROBANTES
// Alianza Comunitaria Tinacos · 2026
// Archivo: /api/agentes/generador.js
// ============================================================

import { supabaseAdmin as supabase } from '../../../lib/supabase'
import { jsPDF } from 'jspdf'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { lead_id } = req.body
  if (!lead_id) return res.status(400).json({ error: 'lead_id requerido' })

  try {
    // 1. Obtener datos completos del lead
    const { data: lead, error: leadError } = await supabase
      .from('tinacos_leads')
      .select('*')
      .eq('id', lead_id)
      .single()

    if (leadError || !lead) throw new Error('Lead no encontrado')
    if (lead.estado !== 'completo') throw new Error('Lead incompleto — no se genera comprobante')

    // 2. Obtener precio del catálogo
    const { data: catalogo } = await supabase
      .from('tinacos_catalogo')
      .select('precio_venta, descripcion')
      .eq('capacidad_lts', lead.capacidad_lts)
      .single()

    // 3. Crear registro de apartado
    const { data: apartado, error: aptError } = await supabase
      .from('tinacos_apartados')
      .insert({
        lead_id:          lead.id,
        nombre_cliente:   lead.nombre,
        telefono:         lead.telefono,
        municipio:        lead.municipio,
        direccion:        lead.direccion,
        tipo_entrega:     lead.tipo_entrega,
        punto_recoleccion: lead.punto_recoleccion,
        cantidad:         lead.cantidad,
        capacidad_lts:    lead.capacidad_lts,
        estado:           'pendiente_confirmacion'
      })
      .select('id, folio_apartado')
      .single()

    if (aptError) throw aptError

    // 4. Generar HTML del comprobante (se convierte a PDF via Playwright en producción)
    const htmlComprobante = generarHTMLComprobante(lead, apartado, catalogo)

    // 5. Actualizar lead a estado 'apartado'
    await supabase.from('tinacos_leads')
      .update({ estado: 'apartado', updated_at: new Date().toISOString() })
      .eq('id', lead.id)

    // 6. Log
    await supabase.from('tinacos_agentes_log').insert({
      lead_id: lead.id,
      agente: 'generador',
      accion: 'comprobante_generado',
      resultado: 'ok',
      detalle: {
        folio_apartado: apartado.folio_apartado,
        cliente: lead.nombre,
        municipio: lead.municipio,
        cantidad: lead.cantidad,
        capacidad: lead.capacidad_lts
      }
    })

    // 7. Disparar Agente Enviador
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/agentes/enviador`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apartado_id: apartado.id,
        telefono: lead.telefono,
        nombre: lead.nombre,
        folio: apartado.folio_apartado,
        html_comprobante: htmlComprobante
      })
    })

    return res.status(200).json({
      ok: true,
      folio_apartado: apartado.folio_apartado,
      apartado_id: apartado.id
    })

  } catch (error) {
    console.error('[GENERADOR] Error:', error)
    return res.status(500).json({ ok: false, error: error.message })
  }
}

// ── GENERAR HTML DEL COMPROBANTE ──────────────────────────
function generarHTMLComprobante(lead, apartado, catalogo) {
  const fecha = new Date().toLocaleDateString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
  const hora = new Date().toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit'
  })

  const entregaTipo = lead.tipo_entrega === 'domicilio'
    ? `A domicilio: ${lead.direccion}${lead.referencia ? ' — ' + lead.referencia : ''}`
    : `Punto de recolección: ${lead.punto_recoleccion}`

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;background:#f0ede8;display:flex;justify-content:center;padding:20px;}
  .card{background:#fff;width:380px;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);}
  .top{background:#0D4A8B;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;}
  .logo{font-size:14px;font-weight:700;color:#fff;letter-spacing:1px;}
  .badge{background:#00c47a;border-radius:20px;padding:4px 10px;font-size:10px;font-weight:700;color:#fff;}
  .hero{background:linear-gradient(180deg,#0D4A8B,#1a6fd4);padding:20px;text-align:center;}
  .hero-icon{font-size:40px;margin-bottom:6px;}
  .hero-label{font-size:9px;color:rgba(255,255,255,0.6);letter-spacing:2px;text-transform:uppercase;}
  .hero-titulo{font-size:20px;font-weight:700;color:#fff;margin:4px 0;}
  .hero-folio{font-size:11px;color:#F5B800;font-weight:700;margin-top:4px;}
  .hero-fecha{font-size:9px;color:rgba(255,255,255,0.4);margin-top:4px;}
  .datos{padding:14px 18px;}
  .row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f0ede4;}
  .row:last-child{border-bottom:none;}
  .key{font-size:10px;color:#999;}
  .val{font-size:11px;font-weight:700;color:#1a1a2e;text-align:right;max-width:200px;}
  .val.blue{color:#0D4A8B;}
  .val.green{color:#00a878;}
  .concepto{background:#f0f7ff;padding:10px 18px;border-top:1px solid #dce8f5;border-bottom:1px solid #dce8f5;}
  .c-label{font-size:9px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;}
  .c-val{font-size:12px;font-weight:700;color:#0D4A8B;}
  .nota{background:#fff8e6;padding:10px 18px;font-size:9px;color:#8a6800;border-bottom:1px solid #f0d060;}
  .footer{background:#07091A;padding:10px 18px;text-align:center;}
  .f1{font-size:9px;color:rgba(255,255,255,0.35);}
  .f2{font-size:8px;color:rgba(255,255,255,0.2);font-style:italic;margin-top:2px;}
</style></head><body>
<div class="card">
  <div class="top">
    <div class="logo">Alianza Comunitaria</div>
    <div class="badge">APARTADO</div>
  </div>
  <div class="hero">
    <div class="hero-icon">🪣</div>
    <div class="hero-label">Comprobante de apartado</div>
    <div class="hero-titulo">${lead.cantidad} Tinaco${lead.cantidad > 1 ? 's' : ''} ${lead.capacidad_lts}L</div>
    <div class="hero-folio">${apartado.folio_apartado}</div>
    <div class="hero-fecha">${fecha} · ${hora}</div>
  </div>
  <div class="datos">
    <div class="row"><span class="key">Cliente</span><span class="val">${lead.nombre}</span></div>
    <div class="row"><span class="key">Teléfono</span><span class="val blue">${lead.telefono}</span></div>
    <div class="row"><span class="key">Municipio</span><span class="val">${lead.municipio}</span></div>
    <div class="row"><span class="key">Cantidad</span><span class="val">${lead.cantidad} tinaco${lead.cantidad > 1 ? 's' : ''}</span></div>
    <div class="row"><span class="key">Capacidad</span><span class="val">${lead.capacidad_lts} litros</span></div>
    <div class="row"><span class="key">Pago</span><span class="val green">Contra entrega</span></div>
  </div>
  <div class="concepto">
    <div class="c-label">Dirección / Punto de entrega</div>
    <div class="c-val">${entregaTipo}</div>
  </div>
  <div class="nota">⚠ Este comprobante confirma tu apartado. El pago se realiza al momento de la entrega. Responde <strong>SÍ</strong> para confirmar.</div>
  <div class="footer">
    <div class="f1">Alianza Comunitaria para el Desarrollo · ${lead.municipio}, Veracruz</div>
    <div class="f2">Folio: ${apartado.folio_apartado} · Tecnología: Governia S.A.P.I de C.V</div>
  </div>
</div>
</body></html>`
}
