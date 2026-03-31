// ============================================================
// AGENTE 1 — EXTRACTOR
// Alianza Comunitaria Tinacos · 2026
// Archivo: /api/agentes/extractor.js
//
// Recibe el webhook de Chatlevel cuando un cliente
// completa el flow "Bienvenida Tinacos" y dispara
// el pipeline completo: Filtrador → Generador → Enviador
// ============================================================

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  'https://mcwlpopucpxfjdawxlgk.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

// ── VALIDAR FIRMA DEL WEBHOOK ─────────────────────────────
function validarFirma(req) {
  const secret = process.env.CHATLEVEL_WEBHOOK_SECRET
  if (!secret) return true // si no hay secret configurado, permitir
  const firma = req.headers['x-chatlevel-signature'] || req.headers['x-signature']
  if (!firma) return false
  const body = JSON.stringify(req.body)
  const esperada = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(esperada))
}

// ── NORMALIZAR TEXTO ──────────────────────────────────────
function norm(t) {
  if (!t) return ''
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()
}

// ── EXTRAER DATOS DEL PAYLOAD DE CHATLEVEL ───────────────
function extraerDatos(payload) {
  const contacto = payload.contact     || payload.customer   || {}
  const campos   = payload.custom_fields || payload.fields   || payload.variables || {}
  const conv     = payload.conversation  || {}

  // Teléfono — limpiar formato
  let telefono = contacto.phone || contacto.phone_number || campos.telefono || null
  if (telefono) {
    telefono = telefono.toString().replace(/[\s\-\+\(\)]/g, '')
    if (telefono.startsWith('521')) telefono = telefono.slice(2)
    if (telefono.startsWith('52'))  telefono = telefono.slice(2)
    if (telefono.length > 10)       telefono = telefono.slice(-10)
  }

  // Municipio — normalizar
  const municipioRaw = campos.municipio || campos.ciudad || campos.localidad || contacto.city || null
  const municipio    = municipioRaw ? norm(municipioRaw) : null

  // Tipo de entrega — detectar por texto
  const entregaRaw = norm(campos.tipo_entrega || campos.entrega || campos.delivery || '')
  let tipo_entrega = 'domicilio'
  if (entregaRaw.includes('punto') || entregaRaw.includes('recolec') || entregaRaw === '1') {
    tipo_entrega = 'punto_recoleccion'
  }

  // Cantidad — default 1
  const cantidadRaw = campos.cantidad || campos.cuantos || campos.quantity || 1
  const cantidad    = Math.min(Math.max(parseInt(cantidadRaw) || 1, 1), 2)

  // Dirección
  const direccion = campos.direccion || campos.address || campos.domicilio || null

  // Punto de recolección
  const punto_recoleccion = campos.punto_recoleccion || campos.punto || null

  return {
    nombre:           contacto.name    || campos.nombre    || campos.name  || null,
    telefono,
    municipio,
    colonia:          campos.colonia   || campos.barrio    || null,
    direccion:        direccion,
    referencia:       campos.referencia || campos.referencias || null,
    tipo_entrega,
    punto_recoleccion,
    cantidad,
    capacidad_lts:    1200, // Ecotec fijo por ahora
    chat_id:          conv.id || payload.conversation_id || payload.chat_id || null,
    canal_origen:     'chatlevel',
    agente_proceso:   'extractor_v1'
  }
}

// ── HANDLER PRINCIPAL ─────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const startTime = Date.now()

  // Validar firma
  if (!validarFirma(req)) {
    console.warn('[EXTRACTOR] Firma inválida')
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const payload = req.body
  console.log('[EXTRACTOR] Payload recibido:', JSON.stringify(payload).slice(0, 300))

  try {
    // 1. Extraer datos del payload de Chatlevel
    const datos = extraerDatos(payload)

    // 2. Log de recepción
    await supabase.from('tinacos_agentes_log').insert({
      agente: 'extractor',
      accion: 'webhook_recibido',
      resultado: 'ok',
      detalle: {
        telefono: datos.telefono,
        municipio: datos.municipio,
        chat_id: datos.chat_id,
        campos_recibidos: Object.keys(payload.custom_fields || payload.fields || {})
      }
    })

    // 3. Llamar al Agente 2 (Filtrador)
    const filtResult = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/agentes/filtrador`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })

    const filtData = await filtResult.json()

    // 4. Responder a Chatlevel (debe ser < 5 segundos)
    return res.status(200).json({
      ok:           true,
      recibido:     true,
      lead_folio:   filtData.folio  || null,
      completo:     filtData.completo || false,
      faltantes:    filtData.faltantes || [],
      tiempo_ms:    Date.now() - startTime
    })

  } catch (error) {
    console.error('[EXTRACTOR] Error:', error)

    await supabase.from('tinacos_agentes_log').insert({
      agente: 'extractor',
      accion: 'webhook_recibido',
      resultado: 'error',
      detalle: { error: error.message, payload_keys: Object.keys(payload) }
    }).catch(() => {})

    return res.status(500).json({ ok: false, error: error.message })
  }
}

// ============================================================
// CONFIGURACIÓN DEL WEBHOOK EN CHATLEVEL
//
// URL del webhook:
//   https://tu-dominio.vercel.app/api/agentes/extractor
//
// Evento a escuchar en Chatlevel:
//   → "Flow completed" o "Conversation updated"
//   → Específicamente cuando termina el flow "Bienvenida Tinacos"
//
// Headers que Chatlevel envía (verificar en su docs):
//   Content-Type: application/json
//   x-chatlevel-signature: <hmac-sha256>
//
// Campos que debe enviar Chatlevel (configurar en el flow):
//   contact.name       → nombre del cliente
//   contact.phone      → teléfono
//   fields.municipio   → municipio
//   fields.cantidad    → 1 o 2
//   fields.tipo_entrega → "domicilio" o "punto"
//   fields.direccion   → si es domicilio
//   conversation.id    → para seguimiento
// ============================================================

// ── TEST PAYLOAD (para probar con curl o Postman) ─────────
/*
curl -X POST https://tu-dominio.vercel.app/api/agentes/extractor \
  -H "Content-Type: application/json" \
  -d '{
    "contact": {
      "name": "María García",
      "phone": "9221234567"
    },
    "custom_fields": {
      "municipio": "Coatzacoalcos",
      "cantidad": "1",
      "tipo_entrega": "domicilio",
      "direccion": "Calle Juárez 45, Col. Centro"
    },
    "conversation_id": "test_001"
  }'
*/
