import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variables de entorno Supabase no encontradas (URL o SERVICE_KEY)')
}

// Advertencia: este cliente usa la Service Role Key, 
// bypassa cualquier RLS. Úsalo SIEMPRE desde Next.js Server Components.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
