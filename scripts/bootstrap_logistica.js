const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mcwlpopucpxfjdawxlgk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jd2xwb3B1Y3B4ZmpkYXd4bGdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMwNzkwMywiZXhwIjoyMDg5ODgzOTAzfQ.8Zf9GRQBggGSN6uZa-HUm8nMziW8PpefPm28gtuO2VA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function bootstrapLogistica() {
  console.log('--- 1. LIMPIANDO DATOS DE PRUEBA ---');
  await supabase.from('tinacos_entrega_detalle').delete().neq('id', '00000000-0000-4000-a000-000000000000');
  await supabase.from('tinacos_entregas').delete().neq('id', '00000000-0000-4000-a000-000000000000');
  await supabase.from('tinacos_apartados').delete().neq('id', '00000000-0000-4000-a000-000000000000');

  console.log('--- 2. CREANDO 5 RUTAS REALES PARA MAÑANA (3 ABRIL) ---');
  const zones = [
    { m: 'Minatitlán', n: 'RUTA MINATITLÁN' },
    { m: 'Coatzacoalcos', n: 'RUTA COATZACOALCOS & VILLA ALLENDE' },
    { m: 'Acayucan', n: 'RUTA ACAYUCAN & OLUTA' },
    { m: 'Cosoleacaque', n: 'RUTA COSOLEACAQUE & OTEAPAN' },
    { m: 'Zona Rural', n: 'RUTA RURAL SUR' }
  ];

  const createdRoutes = {};
  for (const z of zones) {
    const { data, error } = await supabase.from('tinacos_entregas').insert({
      municipio: z.m,
      fecha_entrega: '2026-04-03',
      estado: 'planificada',
      notas_ruta: z.n
    }).select().single();
    if (data) createdRoutes[z.m] = data.id;
  }

  console.log('--- 3. VINCULANDO 30 LEADS A SUS RUTAS ---');
  const { data: leads } = await supabase.from('tinacos_leads').select('*').ilike('folio', 'BTP-%');

  for (const [index, l] of leads.entries()) {
    // a. Crear Apartado
    const { data: apt } = await supabase.from('tinacos_apartados').insert({
      lead_id: l.id,
      nombre_cliente: l.nombre,
      telefono: l.telefono,
      municipio: l.municipio,
      direccion: l.direccion,
      tipo_entrega: l.tipo_entrega,
      cantidad: l.cantidad,
      capacidad_lts: l.capacidad_lts,
      estado: 'confirmado',
      confirmado: true
    }).select().single();

    if (apt) {
      // b. Determinar Ruta
      let routeId = createdRoutes['Zona Rural'];
      if (l.municipio.toLowerCase().includes('minatitlan')) routeId = createdRoutes['Minatitlán'];
      if (l.municipio.toLowerCase().includes('coatzacoalcos')) routeId = createdRoutes['Coatzacoalcos'];
      if (l.municipio.toLowerCase().includes('acayucan') || l.municipio.toLowerCase().includes('oluta')) routeId = createdRoutes['Acayucan'];
      if (l.municipio.toLowerCase().includes('cosoleacaque') || l.municipio.toLowerCase().includes('oteapan')) routeId = createdRoutes['Cosoleacaque'];

      // c. Insertar Detalle
      await supabase.from('tinacos_entrega_detalle').insert({
        entrega_id: routeId,
        apartado_id: apt.id,
        orden_ruta: index + 1,
        estado_entrega: 'pendiente'
      });
      console.log(`✅ ${l.folio} vinculado a ${l.municipio}`);
    }
  }
  console.log('--- LOGÍSTICA LISTA ---');
}

bootstrapLogistica();
