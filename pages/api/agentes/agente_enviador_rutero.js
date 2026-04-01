// ============================================================
// AGENTE 4 — ENVIADOR DE COMPROBANTES + CONFIRMACIÓN
// Alianza Comunitaria Tinacos · 2026
// Archivo: /api/agentes/enviador.js
// ============================================================

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mcwlpopucpxfjdawxlgk.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { apartado_id, telefono, nombre, folio, html_comprobante } = req.body

  try {
    // 1. Enviar comprobante por WhatsApp via Chatlevel API
    await enviarWhatsApp(telefono, nombre, folio, html_comprobante)

    // 2. Marcar comprobante como enviado
    await supabase.from('tinacos_apartados')
      .update({
        comprobante_enviado: true,
        fecha_envio_comprobante: new Date().toISOString()
      })
      .eq('id', apartado_id)

    // 3. Log
    await supabase.from('tinacos_agentes_log').insert({
      agente: 'enviador',
      accion: 'comprobante_enviado',
      resultado: 'ok',
      detalle: { apartado_id, telefono, folio }
    })

    return res.status(200).json({ ok: true, folio, enviado: true })

  } catch (error) {
    console.error('[ENVIADOR] Error:', error)

    await supabase.from('tinacos_agentes_log').insert({
      agente: 'enviador',
      accion: 'comprobante_enviado',
      resultado: 'error',
      detalle: { error: error.message, apartado_id }
    })

    return res.status(500).json({ ok: false, error: error.message })
  }
}

async function enviarWhatsApp(telefono, nombre, folio, htmlComprobante) {
  // Mensaje de texto con comprobante
  const mensaje = `Hola *${nombre}* 👋

Tu apartado ha sido registrado exitosamente ✅

📋 *Folio:* ${folio}
🪣 *Tu tinaco está apartado*

📎 Te enviamos tu comprobante adjunto.

Para *confirmar* tu pedido responde *SÍ*
Para cancelar responde *NO*

⚠️ _El pago se realiza al momento de la entrega._

_Alianza Comunitaria para el Desarrollo_`

  // Llamada a Chatlevel API
  const response = await fetch('https://api.chatlevel.io/v1/messages/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.CHATLEVEL_API_KEY}`
    },
    body: JSON.stringify({
      phone: telefono,
      message: mensaje,
      type: 'text'
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Chatlevel error: ${err}`)
  }

  return response.json()
}

// ============================================================
// WEBHOOK — RECIBIR CONFIRMACIÓN DEL CLIENTE
// Archivo: /api/agentes/confirmacion.js
// Chatlevel llama este endpoint cuando el cliente responde
// ============================================================

export async function recibirConfirmacion(req, res) {
  const { telefono, mensaje, conversation_id } = req.body

  try {
    const respuesta = normalizar(mensaje)
    const confirma  = ['si', 'sí', 'yes', 'confirmo', 'confirmado', 'dale', 'ok'].includes(respuesta)
    const cancela   = ['no', 'cancelar', 'cancel', 'no quiero'].includes(respuesta)

    if (!confirma && !cancela) {
      // Respuesta ambigua — repreguntar
      await enviarWhatsApp(telefono, '', '', null)
      return res.status(200).json({ ok: true, accion: 'repreguntar' })
    }

    // Buscar apartado pendiente por teléfono
    const { data: apartado } = await supabase
      .from('tinacos_apartados')
      .select('id, folio_apartado, lead_id, municipio, cantidad')
      .eq('telefono', telefono)
      .eq('estado', 'pendiente_confirmacion')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!apartado) {
      return res.status(200).json({ ok: true, accion: 'sin_apartado_pendiente' })
    }

    if (confirma) {
      // Confirmar apartado
      await supabase.from('tinacos_apartados').update({
        confirmado: true,
        fecha_confirmacion: new Date().toISOString(),
        mensaje_confirmacion: mensaje,
        estado: 'confirmado'
      }).eq('id', apartado.id)

      await supabase.from('tinacos_leads').update({
        estado: 'confirmado'
      }).eq('id', apartado.lead_id)

      // Responder al cliente
      await enviarWhatsApp(telefono, '', apartado.folio_apartado, null)

      // Log
      await supabase.from('tinacos_agentes_log').insert({
        lead_id: apartado.lead_id,
        agente: 'enviador',
        accion: 'confirmacion_recibida',
        resultado: 'ok',
        detalle: { folio: apartado.folio_apartado, confirmado: true }
      })

      // Disparar Agente Rutero para actualizar rutas
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/agentes/rutero`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ municipio: apartado.municipio })
      })

    } else {
      // Cancelar apartado
      await supabase.from('tinacos_apartados').update({
        estado: 'cancelado'
      }).eq('id', apartado.id)

      await supabase.from('tinacos_leads').update({
        estado: 'cancelado'
      }).eq('id', apartado.lead_id)
    }

    return res.status(200).json({ ok: true, accion: confirma ? 'confirmado' : 'cancelado' })

  } catch (error) {
    console.error('[CONFIRMACION] Error:', error)
    return res.status(500).json({ ok: false, error: error.message })
  }
}

function normalizar(texto) {
  if (!texto) return ''
  return texto.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}


// ============================================================
// AGENTE 5 — RUTERO
// Genera rutas por municipio con Google Maps
// Archivo: /api/agentes/rutero.js
// ============================================================

export async function rutero(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { municipio, fecha_entrega } = req.body

  try {
    // 1. Obtener todos los confirmados del municipio sin ruta asignada
    const { data: apartados } = await supabase
      .from('tinacos_apartados')
      .select(`
        id, folio_apartado,
        nombre_cliente, telefono,
        municipio, direccion, referencia,
        tipo_entrega, punto_recoleccion,
        cantidad, capacidad_lts
      `)
      .eq('municipio', municipio)
      .eq('confirmado', true)
      .eq('estado', 'confirmado')
      .order('created_at', { ascending: true })

    if (!apartados || apartados.length === 0) {
      return res.status(200).json({ ok: true, mensaje: 'Sin confirmados para rutear', municipio })
    }

    // 2. Separar domicilios vs puntos de recolección
    const domicilios    = apartados.filter(a => a.tipo_entrega === 'domicilio')
    const recolecciones = apartados.filter(a => a.tipo_entrega !== 'domicilio')

    // 3. Generar URL de Google Maps con waypoints (domicilios)
    const mapsUrl = generarUrlMaps(municipio, domicilios)

    // 4. Crear registro de entrega
    const totalTinacos = apartados.reduce((sum, a) => sum + a.cantidad, 0)

    const { data: entrega } = await supabase
      .from('tinacos_entregas')
      .insert({
        municipio,
        fecha_entrega: fecha_entrega || null,
        estado: 'planificada',
        maps_url: mapsUrl,
        total_tinacos: totalTinacos,
        notas_ruta: `${domicilios.length} domicilios + ${recolecciones.length} puntos recolección`
      })
      .select('id, folio_entrega')
      .single()

    // 5. Crear detalles de entrega (orden de paradas)
    const detalles = apartados.map((apt, idx) => ({
      entrega_id:  entrega.id,
      apartado_id: apt.id,
      orden_ruta:  idx + 1,
      estado_entrega: 'pendiente'
    }))

    await supabase.from('tinacos_entrega_detalle').insert(detalles)

    // 6. Actualizar apartados a "listo_entrega"
    const ids = apartados.map(a => a.id)
    await supabase.from('tinacos_apartados')
      .update({ estado: 'listo_entrega' })
      .in('id', ids)

    // 7. Log
    await supabase.from('tinacos_agentes_log').insert({
      agente: 'rutero',
      accion: 'ruta_generada',
      resultado: 'ok',
      detalle: {
        folio_entrega: entrega.folio_entrega,
        municipio,
        total_paradas: apartados.length,
        total_tinacos: totalTinacos,
        maps_url: mapsUrl
      }
    })

    console.log(`[RUTERO] Ruta ${entrega.folio_entrega} — ${municipio} — ${totalTinacos} tinacos`)

    return res.status(200).json({
      ok: true,
      folio_entrega: entrega.folio_entrega,
      municipio,
      total_paradas: apartados.length,
      total_tinacos: totalTinacos,
      maps_url: mapsUrl
    })

  } catch (error) {
    console.error('[RUTERO] Error:', error)
    return res.status(500).json({ ok: false, error: error.message })
  }
}

function generarUrlMaps(municipio, domicilios) {
  if (!domicilios || domicilios.length === 0) {
    return `https://www.google.com/maps/search/${encodeURIComponent(municipio + ', Veracruz')}`
  }

  // Origen: municipio
  const origen = encodeURIComponent(`${municipio}, Veracruz, México`)

  // Waypoints: todas las direcciones
  const waypoints = domicilios
    .slice(0, -1) // todos menos el último
    .map(a => encodeURIComponent(`${a.direccion}, ${municipio}, Veracruz`))
    .join('|')

  // Destino: última dirección
  const destino = encodeURIComponent(
    `${domicilios[domicilios.length - 1].direccion}, ${municipio}, Veracruz`
  )

  // URL de Google Maps con ruta optimizada
  const base = 'https://www.google.com/maps/dir/?api=1'
  let url = `${base}&origin=${origen}&destination=${destino}&travelmode=driving`
  if (waypoints) url += `&waypoints=optimize:true|${waypoints}`

  return url
}
