import 'server-only'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export type RoleName = 'Administrador' | 'Empleado'

export interface UserProfile {
  id_usuario: string
  nombre: string
  id_rol: number
  activo: boolean
  email: string | null
  rol: RoleName | null
}

/**
 * Obtiene el perfil del usuario autenticado actual.
 * Devuelve null si no hay sesion o si el perfil aun no existe.
 *
 * Cacheado por request usando React `cache` para evitar viajes
 * redundantes a Supabase cuando lo consumen varios server components.
 */
export const getCurrentProfile = cache(async (): Promise<UserProfile | null> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('usuarios')
    .select('id_usuario, nombre, id_rol, activo, roles(nombre)')
    .eq('id_usuario', user.id)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  const rolNombre = (data as any).roles?.nombre as RoleName | undefined

  return {
    id_usuario: data.id_usuario,
    nombre: data.nombre,
    id_rol: data.id_rol,
    activo: data.activo,
    email: user.email ?? null,
    rol: rolNombre ?? null,
  }
})

export function isAdmin(profile: UserProfile | null): boolean {
  return profile?.rol === 'Administrador'
}

/**
 * Garantiza que exista una sesion. Redirige a /login si no la hay.
 * Tambien bloquea usuarios desactivados.
 */
export async function requireUser(): Promise<UserProfile> {
  const profile = await getCurrentProfile()
  if (!profile) {
    redirect('/login')
  }
  if (!profile.activo) {
    redirect('/login?error=disabled')
  }
  return profile
}

/**
 * Igual que `requireUser` pero ademas exige rol Administrador.
 */
export async function requireAdmin(): Promise<UserProfile> {
  const profile = await requireUser()
  if (!isAdmin(profile)) {
    redirect('/')
  }
  return profile
}
