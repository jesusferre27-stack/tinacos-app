import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

// Cliente para el servidor (Service Role - Bypass RLS)
// Se inicializa de forma segura para evitar bloqueos en el build si las variables faltan
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

if (!supabaseAdmin) {
  console.warn('⚠️ Advertencia: Supabase Admin no inicializado. Faltan variables de entorno.')
}
