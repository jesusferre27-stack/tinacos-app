const { createClient } = require('@supabase/supabase-js');

// ── CONFIGURACIÓN — DIRECTO AL PROYECTO DEL USUARIO ────────
const supabaseUrl = 'https://mcwlpopucpxfjdawxlgk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jd2xwb3B1Y3B4ZmpkYXd4bGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDc5MDMsImV4cCI6MjA4OTg4MzkwM30.9p858TcOBYGXW3yP2P-GLut7knoPQ6wiIuoZ_ryA5Jc';
const supabase = createClient(supabaseUrl, supabaseKey);

const leads = [
  {folio:'BTP-01',m:'minatitlan',n:'Gabriela García Argueta',t:'529221099984',d:'Arroyo Bajo 1 Altos, Col. Infonavit El Paquital'},
  {folio:'BTP-02',m:'minatitlan',n:'Juan Carlos de Jesús Calzada',t:'529382933515',d:'Hidalgo #46, Col. Insurgentes Sur'},
  {folio:'BTP-03',m:'minatitlan',n:'Margarita Madrigal Romero',t:'529221557008',d:'Bernal Díaz del Castillo #28, Col. Buena Vista'},
  {folio:'BTP-04',m:'minatitlan',n:'Ruth Narváez Jiménez',t:'529221897440',d:'Aquiles Serdán #36, Col. Santa Clara'},
  {folio:'BTP-05',m:'minatitlan',n:'Gaspar Santiago Franco',t:'522281161267',d:'Puebla #25, Col. Ruiz Cortines'},
  {folio:'BTP-06',m:'minatitlan',n:'Elena Jiménez Casanova',t:'529221042721',d:'Calle Ignacio Allende #9, Ejido Tacoteno'},
  {folio:'BTP-07',m:'texistepec',n:'Daniel Ruperto Librado',t:'528242493085',d:'Porfirio Díaz int #57, Col. Centro'},
  {folio:'BTP-08',m:'tecuanapa',n:'Edgar González Cancino',t:'529241194874',d:'Carretera por la Pepsi, cerca de Chevrolet'},
  {folio:'BTP-09',m:'pajapan',n:'Andrea Ramírez Hernández',t:'528221386758',d:'Recoge en Punto',te:'punto_recoleccion'},
  {folio:'BTP-10',m:'coacotla',n:'Asunción Hernández Martínez',t:'529221232957',d:'Francisco Márquez #20, Coacotla adelante de Zaragoza'},
  {folio:'BTP-11',m:'oluta',n:'Doris Ledesma Vargas',t:'529241797537',d:'Recoge en Punto',te:'punto_recoleccion'},
  {folio:'BTP-12',m:'oluta',n:'Idalia Sánchez Torres',t:'528899878230',d:'Recoge en el domo - Oluta',te:'punto_recoleccion'},
  {folio:'BTP-13',m:'coacotla',n:'Gloria Hernández Santiago',t:'529221211538',d:'Sor Juana Inés de la Cruz #43, Barrio Tercero'},
  {folio:'BTP-14',m:'acayucan',n:'Cristian Pérez Nolasco',t:'522722345807',d:'Calle Aldama entre Carlos Grossman, Col. Ramones #2'},
  {folio:'BTP-15',m:'acayucan',n:'José Alberto Vidaña López',t:'529241182953',d:'Recoge en Punto',te:'punto_recoleccion'},
  {folio:'BTP-16',m:'acayucan',n:'Isabel Reyes Antonio',t:'529241143188',d:'Calle Retorno del Litoral #5, Barrio La Palma'},
  {folio:'BTP-17',m:'acayucan',n:'Alejandro Tranquilino Hernández',t:'526712641132',d:'Calle 904 int. Manuel de la Peña C.P. 96005'},
  {folio:'BTP-18',m:'coatzacoalcos',n:'Marisol Jiménez Alegría',t:'529231199069',d:'Calle Tikal 218 b, Col. Jardines California'},
  {folio:'BTP-19',m:'coatzacoalcos',n:'María Concepción Ramírez Marín',t:'529231199069',d:'Calle Tikal 219 A, Col. Jardines California'},
  {folio:'BTP-20',m:'coatzacoalcos',n:'Griselda Monleon',t:'529211868986',d:'Col. Villa San Martín'},
  {folio:'BTP-21',m:'coatzacoalcos',n:'Claudia Gutiérrez',t:'529213068903',d:'Carretera Transísmica Km. 95, Col. Estero del Pantano'},
  {folio:'BTP-22',m:'coatzacoalcos',n:'Víctor Manuel Mazariegos Zúñiga',t:'529211408198',d:'Recoge en Punto',te:'punto_recoleccion'},
  {folio:'BTP-23',m:'coatzacoalcos',n:'Julia Zapata Hernández Ochoa',t:'529214213426',d:'Col. Cristóbal Colón #1103'},
  {folio:'BTP-24',m:'coatzacoalcos',n:'Carmen Rodríguez Linares',t:'529211309565',d:'Aquiles Serdán #1412, Col. Benito Juárez Norte'},
  {folio:'BTP-25',m:'coatzacoalcos',n:'Ariana Monserrat Cruz Cruz',t:'529211509524',d:'Calle Manuel Avila Camacho L-SM 45 Z-1 #22, Col. Canticas'},
  {folio:'BTP-26',m:'lomas_barrillas',n:'José Luis Jacome Reyes',t:'529213122547',d:'Carretera a Barrillas 100m del panteón de Lomas'},
  {folio:'BTP-27',m:'villa_allende',n:'Guadalupe Marroquín Welcom',t:'529212352267',d:'Avenida #307, Col. Centro Villa Allende'},
  {folio:'BTP-28',m:'cosoleacaque',n:'Cruz María Ochoa Sánchez',t:'529222093974',d:'Luis Echeverría #108, Col. Agustín Melgar 2a Sección'},
  {folio:'BTP-29',m:'cosoleacaque',n:'Eva Francisco Ramírez',t:'529221202287',d:'Francisco Villa #55, Col. Veracruz'},
  {folio:'BTP-30',m:'oteapan',n:'Arturo Martínez',t:'529221220162',d:'Jardines #2002 entre Allende y Campesinos, Barrio Naranjal'}
];

async function run() {
  console.log('--- INICIO CARGA DIRECTA ---');
  for (const l of leads) {
    const data = {
      folio: l.folio,
      nombre: l.n,
      telefono: l.t,
      municipio: l.m,
      direccion: l.d,
      cantidad: 1,
      capacidad_lts: 1200,
      tipo_entrega: l.te || 'domicilio',
      estado: 'completo',
      canal_origen: 'manual_import',
      agente_proceso: 'antigravity_fix_v2'
    };

    const { error } = await supabase.from('tinacos_leads').upsert(data, { onConflict: 'folio' });
    if (error) {
      console.error(`Error en ${l.folio}:`, error.message);
    } else {
      console.log(`✅ ${l.folio} — Inyectado`);
    }
  }
  console.log('--- FIN CARGA DIRECTA ---');
}

run();
