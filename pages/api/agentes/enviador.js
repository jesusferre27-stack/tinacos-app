import { supabaseAdmin as supabase } from '../../../lib/supabase'

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
  const mensaje = `Hola *${nombre}* 👋

Tu apartado ha sido registrado exitosamente ✅

📋 *Folio:* ${folio}
🪣 *Tu tinaco está apartado*

📎 Te enviamos tu comprobante adjunto.

Para *confirmar* tu pedido responde *SÍ*
Para cancelar responde *NO*

⚠️ _El pago se realiza al momento de la entrega._

_Alianza Comunitaria para el Desarrollo_`

  const response = await fetch('https://api.chatlevel.io/v1/messages/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.CHATLEVEL_API_KEY || process.env.CLAVE_API_DE_NIVEL_CHAT}`
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
