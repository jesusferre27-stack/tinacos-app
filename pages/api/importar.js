import { supabaseAdmin as supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  // Solo permitir GET para que el usuario pueda visitarlo en el navegador para dispararlo
  if (req.method !== 'GET') return res.status(405).end()

  const leadsData = [
    {folio:'BTP-0402-001', m:'Minatitlán', n:'Gabriela García Argueta', t:'9221099984', d:'Arroyo Bajo 1 Altos, Col. Infonavit El Paquital'},
    {folio:'BTP-0402-002', m:'Minatitlán', n:'Juan Carlos de Jesús Calzada', t:'9382933515', d:'Hidalgo #46, Col. Insurgentes Sur'},
    {folio:'BTP-0402-003', m:'Minatitlán', n:'Margarita Madrigal Romero', t:'9221557008', d:'Bernal Díaz del Castillo #28, Col. Buena Vista'},
    {folio:'BTP-0402-004', m:'Minatitlán', n:'Ruth Narváez Jiménez', t:'9221897440', d:'Aquiles Serdán #36, Col. Santa Clara'},
    {folio:'BTP-0402-005', m:'Minatitlán', n:'Gaspar Santiago Franco', t:'2281161267', d:'Puebla #25, Col. Ruiz Cortines'},
    {folio:'BTP-0402-006', m:'Minatitlán', n:'Elena Jiménez Casanova', t:'9221042721', d:'Calle Ignacio Allende #9, Ejido Tacoteno'},
    {folio:'BTP-0402-007', m:'Texistepec', n:'Daniel Ruperto Librado', t:'8242493085', d:'Porfirio Díaz int #57, Col. Centro'},
    {folio:'BTP-0402-008', m:'Tecuanapa', n:'Edgar González Cancino', t:'9241194874', d:'Carretera por la Pepsi, cerca de Chevrolet'},
    {folio:'BTP-0402-009', m:'Pajapan', n:'Andrea Ramírez Hernández', t:'8221386758', d:'', te:'punto_recoleccion'},
    {folio:'BTP-0402-010', m:'Coacotla', n:'Asunción Hernández Martínez', t:'9221232957', d:'Francisco Márquez #20, Coacotla adelante de Zaragoza'},
    {folio:'BTP-0402-011', m:'Oluta', n:'Doris Ledesma Vargas', t:'9241797537', d:'', te:'punto_recoleccion'},
    {folio:'BTP-0402-012', m:'Oluta', n:'Idalia Sánchez Torres', t:'8899878230', d:'Recoge en el domo - Oluta', te:'punto_recoleccion'},
    {folio:'BTP-0402-013', m:'Coacotla', n:'Gloria Hernández Santiago', t:'9221211538', d:'Sor Juana Inés de la Cruz #43, Barrio Tercero'},
    {folio:'BTP-0402-014', m:'Acayucan', n:'Cristian Pérez Nolasco', t:'2722345807', d:'Calle Aldama entre Carlos Grossman, Col. Ramones #2'},
    {folio:'BTP-0402-015', m:'Acayucan', n:'José Alberto Vidaña López', t:'9241182953', d:'', te:'punto_recoleccion'},
    {folio:'BTP-0402-016', m:'Acayucan', n:'Isabel Reyes Antonio', t:'9241143188', d:'Calle Retorno del Litoral #5, Barrio La Palma'},
    {folio:'BTP-0402-017', m:'Acayucan', n:'Alejandro Tranquilino Hernández', t:'6712641132', d:'Calle 904 int. Manuel de la Peña C.P. 96005'},
    {folio:'BTP-0402-018', m:'Coatzacoalcos', n:'Marisol Jiménez Alegría', t:'9231199069', d:'Calle Tikal 218 b, Col. Jardines California'},
    {folio:'BTP-0402-019', m:'Coatzacoalcos', n:'María Concepción Ramírez Marín', t:'9231199069', d:'Calle Tikal 219 A, Col. Jardines California'},
    {folio:'BTP-0402-020', m:'Coatzacoalcos', n:'Griselda Monleon', t:'9211868986', d:'Col. Villa San Martín'},
    {folio:'BTP-0402-021', m:'Coatzacoalcos', n:'Claudia Gutiérrez', t:'9213068903', d:'Carretera Transísmica Km. 95, Col. Estero del Pantano'},
    {folio:'BTP-0402-022', m:'Coatzacoalcos', n:'Víctor Manuel Mazariegos Zúñiga', t:'9211408198', d:'', te:'punto_recoleccion'},
    {folio:'BTP-0402-023', m:'Coatzacoalcos', n:'Julia Zapata Hernández Ochoa', t:'9214213426', d:'Col. Cristóbal Colón #1103'},
    {folio:'BTP-0402-024', m:'Coatzacoalcos', n:'Carmen Rodríguez Linares', t:'9211309565', d:'Aquiles Serdán #1412, Col. Benito Juárez Norte'},
    {folio:'BTP-0402-025', m:'Coatzacoalcos', n:'Ariana Monserrat Cruz Cruz', t:'9211509524', d:'Calle Manuel Avila Camacho L-SM 45 Z-1 #22, Col. Canticas'},
    {folio:'BTP-0402-026', m:'Lomas de Barrillas', n:'José Luis Jacome Reyes', t:'9213122547', d:'Carretera a Barrillas 100m del panteón de Lomas'},
    {folio:'BTP-0402-027', m:'Villa Allende', n:'Guadalupe Marroquín Welcom', t:'9212352267', d:'Avenida #307, Col. Centro Villa Allende'},
    {folio:'BTP-0402-028', m:'Cosoleacaque', n:'Cruz María Ochoa Sánchez', t:'9222093974', d:'Luis Echeverría #108, Col. Agustín Melgar 2a Sección'},
    {folio:'BTP-0402-029', m:'Cosoleacaque', n:'Eva Francisco Ramírez', t:'9221202287', d:'Francisco Villa #55, Col. Veracruz'},
    {folio:'BTP-0402-030', m:'Oteapan', n:'Arturo Martínez', t:'9221220162', d:'Jardines #2002 entre Allende y Campesinos, Barrio Naranjal'}
  ];

  try {
    const leadsToInsert = leadsData.map(l => ({
      folio: l.folio,
      municipio: l.m,
      nombre: l.n,
      telefono: l.t,
      direccion: l.d,
      estado: 'completo',
      canal_origen: 'manual'
    }));

    // BATCH UPSERT LEADS
    const { data: insertedLeads, error: lErr } = await supabase
      .from('tinacos_leads')
      .upsert(leadsToInsert, { onConflict: 'folio' })
      .select('id, folio');

    if (lErr) throw lErr;

    const apartadosToInsert = insertedLeads.map((il) => {
      const original = leadsData.find(o => o.folio === il.folio);
      return {
        lead_id: il.id,
        folio_apartado: il.folio,
        nombre_cliente: original.n,
        telefono: original.t,
        municipio: original.m,
        direccion: original.d || original.m,
        tipo_entrega: original.te || 'domicilio',
        cantidad: 1,
        capacidad_lts: 1200,
        confirmado: true,
        estado: 'confirmado'
      };
    });

    // BATCH UPSERT APARTADOS
    const { error: aErr } = await supabase
      .from('tinacos_apartados')
      .upsert(apartadosToInsert, { onConflict: 'folio_apartado' });

    if (aErr) throw aErr;

    return res.status(200).json({
      ok: true,
      mensaje: '30 Prospectos cargados correctamente.',
      total: insertedLeads.length
    });
  } catch (error) {
    console.error('Error importacion manual:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
