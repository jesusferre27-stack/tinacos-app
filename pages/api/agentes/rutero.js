import { supabaseAdmin as supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
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

  const origen = encodeURIComponent(`${municipio}, Veracruz, México`)
  const waypoints = domicilios
    .slice(0, -1)
    .map(a => encodeURIComponent(`${a.direccion}, ${municipio}, Veracruz`))
    .join('|')
  const destino = encodeURIComponent(
    `${domicilios[domicilios.length - 1].direccion}, ${municipio}, Veracruz`
  )

  const base = 'https://www.google.com/maps/dir/?api=1'
  let url = `${base}&origin=${origen}&destination=${destino}&travelmode=driving`
  if (waypoints) url += `&waypoints=optimize:true|${waypoints}`

  return url
}
