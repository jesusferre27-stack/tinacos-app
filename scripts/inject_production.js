const leads = [
  {folio:'BTP-0402-001',m:'Minatitlán',n:'Gabriela García Argueta',t:'529221099984',d:'Arroyo Bajo 1 Altos, Col. Infonavit El Paquital'},
  {folio:'BTP-0402-002',m:'Minatitlán',n:'Juan Carlos de Jesús Calzada',t:'529382933515',d:'Hidalgo #46, Col. Insurgentes Sur'},
  {folio:'BTP-0402-003',m:'Minatitlán',n:'Margarita Madrigal Romero',t:'529221557008',d:'Bernal Díaz del Castillo #28, Col. Buena Vista'},
  {folio:'BTP-0402-004',m:'Minatitlán',n:'Ruth Narváez Jiménez',t:'529221897440',d:'Aquiles Serdán #36, Col. Santa Clara'},
  {folio:'BTP-0402-005',m:'Minatitlán',n:'Gaspar Santiago Franco',t:'522281161267',d:'Puebla #25, Col. Ruiz Cortines'},
  {folio:'BTP-0402-006',m:'Minatitlán',n:'Elena Jiménez Casanova',t:'529221042721',d:'Calle Ignacio Allende #9, Ejido Tacoteno'},
  {folio:'BTP-0402-007',m:'Texistepec',n:'Daniel Ruperto Librado',t:'528242493085',d:'Porfirio Díaz int #57, Col. Centro'},
  {folio:'BTP-0402-008',m:'Tecuanapa',n:'Edgar González Cancino',t:'529241194874',d:'Carretera por la Pepsi, cerca de Chevrolet'},
  {folio:'BTP-0402-009',m:'Pajapan',n:'Andrea Ramírez Hernández',t:'528221386758',d:'Recoge en Punto',te:'punto_recoleccion'},
  {folio:'BTP-0402-010',m:'Coacotla',n:'Asunción Hernández Martínez',t:'529221232957',d:'Francisco Márquez #20, Coacotla adelante de Zaragoza'},
  {folio:'BTP-0402-011',m:'Oluta',n:'Doris Ledesma Vargas',t:'529241797537',d:'Recoge en Punto',te:'punto_recoleccion'},
  {folio:'BTP-0402-012',m:'Oluta',n:'Idalia Sánchez Torres',t:'528899878230',d:'Recoge en el domo - Oluta',te:'punto_recoleccion'},
  {folio:'BTP-0402-013',m:'Coacotla',n:'Gloria Hernández Santiago',t:'529221211538',d:'Sor Juana Inés de la Cruz #43, Barrio Tercero'},
  {folio:'BTP-0402-014',m:'Acayucan',n:'Cristian Pérez Nolasco',t:'522722345807',d:'Calle Aldama entre Carlos Grossman, Col. Ramones #2'},
  {folio:'BTP-0402-015',m:'Acayucan',n:'José Alberto Vidaña López',t:'529241182953',d:'Recoge en Punto',te:'punto_recoleccion'},
  {folio:'BTP-0402-016',m:'Acayucan',n:'Isabel Reyes Antonio',t:'529241143188',d:'Calle Retorno del Litoral #5, Barrio La Palma'},
  {folio:'BTP-0402-017',m:'Acayucan',n:'Alejandro Tranquilino Hernández',t:'526712641132',d:'Calle 904 int. Manuel de la Peña C.P. 96005'},
  {folio:'BTP-0402-018',m:'Coatzacoalcos',n:'Marisol Jiménez Alegría',t:'529231199069',d:'Calle Tikal 218 b, Col. Jardines California'},
  {folio:'BTP-0402-019',m:'Coatzacoalcos',n:'María Concepción Ramírez Marín',t:'529231199069',d:'Calle Tikal 219 A, Col. Jardines California'},
  {folio:'BTP-0402-020',m:'Coatzacoalcos',n:'Griselda Monleon',t:'529211868986',d:'Col. Villa San Martín'},
  {folio:'BTP-0402-021',m:'Coatzacoalcos',n:'Claudia Gutiérrez',t:'529213068903',d:'Carretera Transísmica Km. 95, Col. Estero del Pantano'},
  {folio:'BTP-0402-022',m:'Coatzacoalcos',n:'Víctor Manuel Mazariegos Zúñiga',t:'529211408198',d:'Recoge en Punto',te:'punto_recoleccion'},
  {folio:'BTP-0402-023',m:'Coatzacoalcos',n:'Julia Zapata Hernández Ochoa',t:'529214213426',d:'Col. Cristóbal Colón #1103'},
  {folio:'BTP-0402-024',m:'Coatzacoalcos',n:'Carmen Rodríguez Linares',t:'529211309565',d:'Aquiles Serdán #1412, Col. Benito Juárez Norte'},
  {folio:'BTP-0402-025',m:'Coatzacoalcos',n:'Ariana Monserrat Cruz Cruz',t:'529211509524',d:'Calle Manuel Avila Camacho L-SM 45 Z-1 #22, Col. Canticas'},
  {folio:'BTP-0402-026',m:'Lomas de Barrillas',n:'José Luis Jacome Reyes',t:'529213122547',d:'Carretera a Barrillas 100m del panteón de Lomas'},
  {folio:'BTP-0402-027',m:'Villa Allende',n:'Guadalupe Marroquín Welcom',t:'529212352267',d:'Avenida #307, Col. Centro Villa Allende'},
  {folio:'BTP-0402-028',m:'Cosoleacaque',n:'Cruz María Ochoa Sánchez',t:'529222093974',d:'Luis Echeverría #108, Col. Agustín Melgar 2a Sección'},
  {folio:'BTP-0402-029',m:'Cosoleacaque',n:'Eva Francisco Ramírez',t:'529221202287',d:'Francisco Villa #55, Col. Veracruz'},
  {folio:'BTP-0402-030',m:'Oteapan',n:'Arturo Martínez',t:'529221220162',d:'Jardines #2002 entre Allende y Campesinos, Barrio Naranjal'}
];

async function inject() {
  console.log('--- Iniciando Inyección Directa a Producción ---');
  for (const l of leads) {
    const payload = {
      contact: { name: l.n, phone: l.t },
      custom_fields: {
        municipio: l.m,
        direccion: l.d,
        cantidad: 1,
        capacidad: '1200',
        tipo_entrega: l.te || 'domicilio'
      }
    };

    try {
      const res = await fetch('https://tinacos-app.vercel.app/api/agentes/filtrador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log(`[${l.folio}] Status: ${data.ok ? '✅' : '❌'} - ${data.folio || data.error}`);
    } catch (e) {
      console.error(`[${l.folio}] Error Fatal:`, e.message);
    }
    // Pequeño delay para no saturar
    await new Promise(r => setTimeout(r, 300));
  }
}

inject();
