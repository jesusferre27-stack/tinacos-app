// ============================================================
// AGENTE 2 — FILTRADOR DE LEADS
// Alianza Comunitaria Tinacos · 2026
// Stack: Node.js / Next.js API Route
// Archivo: /api/agentes/filtrador.js
// ============================================================

import { supabaseAdmin as supabase } from '../../../lib/supabase'

// ── CAMPOS REQUERIDOS PARA LEAD COMPLETO ──────────────────
const CAMPOS_REQUERIDOS = ['nombre', 'telefono', 'municipio', 'cantidad', 'capacidad_lts']
const CAMPOS_ENTREGA    = ['direccion'] // solo si tipo_entrega = 'domicilio'

// ── CAPACIDADES VÁLIDAS ───────────────────────────────────
const CAPACIDADES_VALIDAS = [450, 600, 750, 1200, 1500, 2500]

// ── MUNICIPIOS DEL SUR DE VERACRUZ ───────────────────────
const MUNICIPIOS_VALIDOS = [
  'soteapan', 'mecayapan', 'pajapan', 'chinameca',
  'jaltipan', 'coatzacoalcos', 'minatitlan', 'acayucan',
  'oluta', 'sayula', 'texistepec', 'agua dulce'
]

// ── NORMALIZAR TEXTO ──────────────────────────────────────
function normalizar(texto) {
  if (!texto) return ''
  return texto.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// ── EXTRAER CAPACIDAD DEL TEXTO ───────────────────────────
function extraerCapacidad(texto) {
  if (!texto) return null
  const num = parseInt(texto.toString().replace(/[^\d]/g, ''))
  // Encontrar la capacidad más cercana válida
  const cercana = CAPACIDADES_VALIDAS.reduce((prev, curr) =>
    Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev
  )
  return Math.abs(cercana - num) <= 100 ? cercana : null
}

// ── VALIDAR LEAD ──────────────────────────────────────────
function validarLead(datos) {
  const faltantes = []

  for (const campo of CAMPOS_REQUERIDOS) {
    if (!datos[campo]) faltantes.push(campo)
  }

  // Si es entrega a domicilio, dirección es obligatoria
  if (datos.tipo_entrega === 'domicilio' && !datos.direccion) {
    faltantes.push('direccion')
  }

  // Validar capacidad
  if (datos.capacidad_lts && !CAPACIDADES_VALIDAS.includes(parseInt(datos.capacidad_lts))) {
    faltantes.push('capacidad_invalida')
  }

  return {
    completo: faltantes.length === 0,
    faltantes
  }
}

// ── PROCESAR MENSAJE DE CHATLEVEL ─────────────────────────
function procesarMensajeChatlevel(payload) {
  // Chatlevel envía los datos del contacto y campos capturados
  const contacto = payload.contact || {}
  const campos   = payload.custom_fields || payload.fields || {}

  return {
    nombre:        contacto.name || campos.nombre || campos.name || null,
    telefono:      contacto.phone || campos.telefono || contacto.phone_number || null,
    municipio:     normalizar(campos.municipio || campos.ciudad || null),
    colonia:       campos.colonia || null,
    direccion:     campos.direccion || campos.address || null,
    referencia:    campos.referencia || campos.referencias || null,
    tipo_entrega:  normalizar(campos.tipo_entrega || campos.entrega || 'domicilio'),
    punto_recoleccion: campos.punto_recoleccion || null,
    cantidad:      parseInt(campos.cantidad || campos.cuantos || 1),
    capacidad_lts: extraerCapacidad(campos.capacidad || campos.litros || campos.tamano),
    chat_id:       payload.conversation_id || payload.chat_id || null,
    canal_origen:  'chatlevel'
  }
}

// ── HANDLER PRINCIPAL ─────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const startTime = Date.now()

  try {
    const payload = req.body
    console.log('[FILTRADOR] Payload recibido:', JSON.stringify(payload))

    // 1. Procesar datos del mensaje
    const datosLead = procesarMensajeChatlevel(payload)

    // 2. Verificar si ya existe por teléfono
    if (datosLead.telefono) {
      const { data: existente } = await supabase
        .from('tinacos_leads')
        .select('id, folio, estado, cantidad, capacidad_lts')
        .eq('telefono', datosLead.telefono)
        .not('estado', 'in', '("cancelado","entregado")')
        .single()

      if (existente) {
        // Actualizar lead existente con datos nuevos
        const { error } = await supabase
          .from('tinacos_leads')
          .update({
            ...datosLead,
            updated_at: new Date().toISOString()
          })
          .eq('id', existente.id)

        await registrarLog(existente.id, 'filtrador', 'actualizar_lead',
          'ok', { mensaje: 'Lead existente actualizado', folio: existente.folio })

        const validacion = validarLead({ ...existente, ...datosLead })

        // Actualizar estado según completitud
        await supabase.from('tinacos_leads')
          .update({ estado: validacion.completo ? 'completo' : 'datos_incompletos' })
          .eq('id', existente.id)

        return res.status(200).json({
          ok: true,
          accion: 'actualizado',
          folio: existente.folio,
          completo: validacion.completo,
          faltantes: validacion.faltantes,
          tiempo_ms: Date.now() - startTime
        })
      }
    }

    // 3. Validar completitud del nuevo lead
    const validacion = validarLead(datosLead)

    // 4. Insertar nuevo lead
    const { data: nuevoLead, error: insertError } = await supabase
      .from('tinacos_leads')
      .insert({
        ...datosLead,
        estado: validacion.completo ? 'completo' : 'datos_incompletos',
        agente_proceso: 'filtrador_v1'
      })
      .select('id, folio')
      .single()

    if (insertError) throw insertError

    // 5. Registrar en log de agentes
    await registrarLog(nuevoLead.id, 'filtrador', 'nuevo_lead',
      'ok', {
        completo: validacion.completo,
        faltantes: validacion.faltantes,
        municipio: datosLead.municipio,
        capacidad: datosLead.capacidad_lts
      })

    // 6. Si está completo → disparar Agente Generador
    if (validacion.completo) {
      await dispararGenerador(nuevoLead.id)
    }

    console.log(`[FILTRADOR] Lead ${nuevoLead.folio} — ${validacion.completo ? '✅ COMPLETO' : '⚠️ INCOMPLETO'}`)

    return res.status(200).json({
      ok: true,
      accion: 'creado',
      folio: nuevoLead.folio,
      lead_id: nuevoLead.id,
      completo: validacion.completo,
      faltantes: validacion.faltantes,
      tiempo_ms: Date.now() - startTime
    })

  } catch (error) {
    console.error('[FILTRADOR] Error:', error)
    return res.status(500).json({
      ok: false,
      error: error.message,
      tiempo_ms: Date.now() - startTime
    })
  }
}

// ── HELPERS ───────────────────────────────────────────────
async function registrarLog(leadId, agente, accion, resultado, detalle) {
  await supabase.from('tinacos_agentes_log').insert({
    lead_id: leadId,
    agente,
    accion,
    resultado,
    detalle
  })
}

async function dispararGenerador(leadId) {
  // Llama al Agente 3 internamente
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/agentes/generador`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: leadId })
    })
  } catch (e) {
    console.error('[FILTRADOR] Error disparando generador:', e.message)
  }
}
