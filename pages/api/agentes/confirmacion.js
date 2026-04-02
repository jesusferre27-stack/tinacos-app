import { supabaseAdmin as supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { telefono, mensaje, conversation_id } = req.body

  try {
    const respuesta = normalizar(mensaje)
    const confirma  = ['si', 'sí', 'yes', 'confirmo', 'confirmado', 'dale', 'ok'].includes(respuesta)
    const cancela   = ['no', 'cancelar', 'cancel', 'no quiero'].includes(respuesta)

    if (!confirma && !cancela) {
      // Respuesta ambigua — repreguntar (puedes llamar a enviarWhatsApp aquí si quieres)
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
