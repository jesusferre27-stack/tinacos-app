const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mcwlpopucpxfjdawxlgk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jd2xwb3B1Y3B4ZmpkYXd4bGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDc5MDMsImV4cCI6MjA4OTg4MzkwM30.9p858TcOBYGXW3yP2P-GLut7knoPQ6wiIuoZ_ryA5Jc';

const supabase = createClient(supabaseUrl, supabaseKey);

const leadsData = [
  {folio:'BTP-0402-001', municipio:'Minatitlán', nombre:'Gabriela García Argueta', telefono:'9221099984', direccion:'Arroyo Bajo 1 Altos, Col. Infonavit El Paquital'},
  {folio:'BTP-0402-002', municipio:'Minatitlán', nombre:'Juan Carlos de Jesús Calzada', telefono:'9382933515', direccion:'Hidalgo #46, Col. Insurgentes Sur'},
  {folio:'BTP-0402-003', municipio:'Minatitlán', nombre:'Margarita Madrigal Romero', telefono:'9221557008', direccion:'Bernal Díaz del Castillo #28, Col. Buena Vista'},
  {folio:'BTP-0402-004', municipio:'Minatitlán', nombre:'Ruth Narváez Jiménez', telefono:'9221897440', direccion:'Aquiles Serdán #36, Col. Santa Clara'},
  {folio:'BTP-0402-005', municipio:'Minatitlán', nombre:'Gaspar Santiago Franco', telefono:'2281161267', direccion:'Puebla #25, Col. Ruiz Cortines'},
  {folio:'BTP-0402-006', municipio:'Minatitlán', nombre:'Elena Jiménez Casanova', telefono:'9221042721', direccion:'Calle Ignacio Allende #9, Ejido Tacoteno'},
  {folio:'BTP-0402-007', municipio:'Texistepec', nombre:'Daniel Ruperto Librado', telefono:'8242493085', direccion:'Porfirio Díaz int #57, Col. Centro'},
  {folio:'BTP-0402-008', municipio:'Tecuanapa', nombre:'Edgar González Cancino', telefono:'9241194874', direccion:'Carretera por la Pepsi, cerca de Chevrolet'},
  {folio:'BTP-0402-009', municipio:'Pajapan', nombre:'Andrea Ramírez Hernández', telefono:'8221386758', direccion:'', tipo_entrega:'punto_recoleccion'},
  {folio:'BTP-0402-010', municipio:'Coacotla', nombre:'Asunción Hernández Martínez', telefono:'9221232957', direccion:'Francisco Márquez #20, Coacotla adelante de Zaragoza'},
  {folio:'BTP-0402-011', municipio:'Oluta', nombre:'Doris Ledesma Vargas', telefono:'9241797537', direccion:'', tipo_entrega:'punto_recoleccion'},
  {folio:'BTP-0402-012', municipio:'Oluta', nombre:'Idalia Sánchez Torres', telefono:'8899878230', direccion:'Recoge en el domo - Oluta', tipo_entrega:'punto_recoleccion'},
  {folio:'BTP-0402-013', municipio:'Coacotla', nombre:'Gloria Hernández Santiago', telefono:'9221211538', direccion:'Sor Juana Inés de la Cruz #43, Barrio Tercero'},
  {folio:'BTP-0402-014', municipio:'Acayucan', nombre:'Cristian Pérez Nolasco', telefono:'2722345807', direccion:'Calle Aldama entre Carlos Grossman, Col. Ramones #2'},
  {folio:'BTP-0402-015', municipio:'Acayucan', nombre:'José Alberto Vidaña López', telefono:'9241182953', direccion:'', tipo_entrega:'punto_recoleccion'},
  {folio:'BTP-0402-016', municipio:'Acayucan', nombre:'Isabel Reyes Antonio', telefono:'9241143188', direccion:'Calle Retorno del Litoral #5, Barrio La Palma'},
  {folio:'BTP-0402-017', municipio:'Acayucan', nombre:'Alejandro Tranquilino Hernández', telefono:'6712641132', direccion:'Calle 904 int. Manuel de la Peña C.P. 96005'},
  {folio:'BTP-0402-018', municipio:'Coatzacoalcos', nombre:'Marisol Jiménez Alegría', telefono:'9231199069', direccion:'Calle Tikal 218 b, Col. Jardines California'},
  {folio:'BTP-0402-019', municipio:'Coatzacoalcos', nombre:'María Concepción Ramírez Marín', telefono:'9231199069', direccion:'Calle Tikal 219 A, Col. Jardines California'},
  {folio:'BTP-0402-020', municipio:'Coatzacoalcos', nombre:'Griselda Monleon', telefono:'9211868986', direccion:'Col. Villa San Martín'},
  {folio:'BTP-0402-021', municipio:'Coatzacoalcos', nombre:'Claudia Gutiérrez', telefono:'9213068903', direccion:'Carretera Transísmica Km. 95, Col. Estero del Pantano'},
  {folio:'BTP-0402-022', municipio:'Coatzacoalcos', nombre:'Víctor Manuel Mazariegos Zúñiga', telefono:'9211408198', direccion:'', tipo_entrega:'punto_recoleccion'},
  {folio:'BTP-0402-023', municipio:'Coatzacoalcos', nombre:'Julia Zapata Hernández Ochoa', telefono:'9214213426', direccion:'Col. Cristóbal Colón #1103'},
  {folio:'BTP-0402-024', municipio:'Coatzacoalcos', nombre:'Carmen Rodríguez Linares', telefono:'9211309565', direccion:'Aquiles Serdán #1412, Col. Benito Juárez Norte'},
  {folio:'BTP-0402-025', municipio:'Coatzacoalcos', nombre:'Ariana Monserrat Cruz Cruz', telefono:'9211509524', direccion:'Calle Manuel Avila Camacho L-SM 45 Z-1 #22, Col. Canticas'},
  {folio:'BTP-0402-026', municipio:'Lomas de Barrillas', nombre:'José Luis Jacome Reyes', telefono:'9213122547', direccion:'Carretera a Barrillas 100m del panteón de Lomas'},
  {folio:'BTP-0402-027', municipio:'Villa Allende', nombre:'Guadalupe Marroquín Welcom', telefono:'9212352267', direccion:'Avenida #307, Col. Centro Villa Allende'},
  {folio:'BTP-0402-028', municipio:'Cosoleacaque', nombre:'Cruz María Ochoa Sánchez', telefono:'9222093974', direccion:'Luis Echeverría #108, Col. Agustín Melgar 2a Sección'},
  {folio:'BTP-0402-029', municipio:'Cosoleacaque', nombre:'Eva Francisco Ramírez', telefono:'9221202287', direccion:'Francisco Villa #55, Col. Veracruz'},
  {folio:'BTP-0402-030', municipio:'Oteapan', nombre:'Arturo Martínez', telefono:'9221220162', direccion:'Jardines #2002 entre Allende y Campesinos, Barrio Naranjal'}
];

async function importData() {
  console.log('--- Iniciando Importación de 30 Leads (Backup) ---');
  
  const leadsToInsert = leadsData.map(l => ({
    folio: l.folio,
    municipio: l.municipio,
    nombre: l.nombre,
    telefono: l.telefono,
    direccion: l.direccion,
    estado: 'completo',
    canal_origen: 'manual'
  }));

  const { data: insertedLeads, error: lErr } = await supabase
    .from('tinacos_leads')
    .upsert(leadsToInsert, { onConflict: 'folio' }) // Usar upsert por si acaso
    .select('id, folio');

  if (lErr) {
    console.error('Error insertando leads:', lErr);
    return;
  }

  console.log(`Leads insertados/actualizados: ${insertedLeads.length}`);

  const apartadosToInsert = insertedLeads.map((il, idx) => {
    const original = leadsData.find(o => o.folio === il.folio);
    return {
      lead_id: il.id,
      folio_apartado: il.folio,
      nombre_cliente: original.nombre,
      telefono: original.telefono,
      municipio: original.municipio,
      direccion: original.direccion || original.municipio,
      tipo_entrega: original.tipo_entrega || 'domicilio',
      cantidad: 1,
      capacidad_lts: 1200,
      confirmado: true,
      estado: 'confirmado'
    };
  });

  const { error: aErr } = await supabase
    .from('tinacos_apartados')
    .upsert(apartadosToInsert, { onConflict: 'folio_apartado' });

  if (aErr) {
    console.error('Error insertando apartados:', aErr);
  } else {
    console.log('--- DATOS CARGADOS EXITOSAMENTE ---');
  }
}

importData();
