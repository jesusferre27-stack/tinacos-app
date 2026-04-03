import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(req, res) {
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase Admin no configurado" });
  }

  try {
    console.log("--- ACTUALIZANDO RLS PARA LOGISTICA ---");
    
    // Usamos rpc() con un comando SQL directo (si está disponible)
    // Pero como rpc('exec_sql') es dudoso, vamos a intentar usar un query que fuerce el select sin políticas
    // En Supabase JS, el cliente Admin ya se salta RLS. 
    // Sin embargo, para que el cliente ANON del navegador lo vea, necesitamos políticas reales.
    
    // Intentaremos crear las políticas de acceso público (SELECT)
    const sql = `
      -- 1. Habilitar lectura pública para las tablas de rutas
      ALTER TABLE tinacos_entregas DISABLE ROW LEVEL SECURITY;
      ALTER TABLE tinacos_entrega_detalle DISABLE ROW LEVEL SECURITY;
      ALTER TABLE tinacos_apartados DISABLE ROW LEVEL SECURITY;
      ALTER TABLE tinacos_leads DISABLE ROW LEVEL SECURITY;
      
      -- Por si acaso, forzamos políticas de SELECT para anon
      DROP POLICY IF EXISTS "permitir_lectura_publica_entregas" ON tinacos_entregas;
      CREATE POLICY "permitir_lectura_publica_entregas" ON tinacos_entregas FOR SELECT TO anon USING (true);
      
      DROP POLICY IF EXISTS "permitir_lectura_public_detalle" ON tinacos_entrega_detalle;
      CREATE POLICY "permitir_lectura_public_detalle" ON tinacos_entrega_detalle FOR SELECT TO anon USING (true);
      
      DROP POLICY IF EXISTS "permitir_lectura_public_apartados" ON tinacos_apartados;
      CREATE POLICY "permitir_lectura_public_apartados" ON tinacos_apartados FOR SELECT TO anon USING (true);
    `;

    // Como rpc('exec_sql') no es estándar, informamos al usuario que lo use en el SQL Editor si no funciona
    // Pero intentaremos un truco: usar rpc si existe
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql });
    
    if (error) {
      console.error("Error ejecutando RPC:", error);
      return res.status(200).json({ 
        message: "Por favor, corre este SQL manualmente en el SQL Editor de Supabase",
        sql: sql,
        error: error.message
      });
    }

    return res.status(200).json({ message: "RLS Desactivado y Políticas creadas" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
