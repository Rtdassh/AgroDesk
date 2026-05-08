import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Cliente con privilegios elevados (service_role).
 * SOLO debe importarse desde server actions / route handlers.
 * NUNCA usar en componentes cliente ni exponer al bundle del navegador.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_URL en las variables de entorno.'
    )
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
