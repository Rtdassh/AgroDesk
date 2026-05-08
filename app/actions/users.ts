"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"

export type AppUser = {
  id_usuario: string
  nombre: string
  email: string | null
  id_rol: number
  rol: string | null
  activo: boolean
  last_sign_in: string | null
  created_at: string | null
}

export async function getRoles() {
  await requireAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("roles")
    .select("id_rol, nombre")
    .order("id_rol", { ascending: true })

  if (error) {
    console.error("Error fetching roles:", error)
    return []
  }
  return data ?? []
}

export async function getUsers(): Promise<AppUser[]> {
  await requireAdmin()
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: profiles, error } = await supabase
    .from("usuarios")
    .select("id_usuario, nombre, id_rol, activo, created_at, roles(nombre)")
    .order("created_at", { ascending: false })

  if (error || !profiles) {
    console.error("Error fetching usuarios:", error)
    return []
  }

  // Obtener emails y last_sign_in_at desde auth.users via Admin API
  const { data: authData } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  const authMap = new Map<string, { email: string | null; last_sign_in_at: string | null }>()
  authData?.users?.forEach((u) =>
    authMap.set(u.id, {
      email: u.email ?? null,
      last_sign_in_at: u.last_sign_in_at ?? null,
    })
  )

  return profiles.map((p: any) => {
    const a = authMap.get(p.id_usuario)
    return {
      id_usuario: p.id_usuario,
      nombre: p.nombre,
      email: a?.email ?? null,
      id_rol: p.id_rol,
      rol: p.roles?.nombre ?? null,
      activo: p.activo,
      last_sign_in: a?.last_sign_in_at ?? null,
      created_at: p.created_at ?? null,
    }
  })
}

export async function createUser(formData: FormData) {
  await requireAdmin()

  const email = (formData.get("email") as string | null)?.trim() ?? ""
  const password = (formData.get("password") as string | null) ?? ""
  const nombre = (formData.get("nombre") as string | null)?.trim() ?? ""
  const id_rol = parseInt((formData.get("id_rol") as string) || "0", 10)

  if (!email || !password || !nombre || !id_rol) {
    return { success: false, error: "Todos los campos son obligatorios." }
  }
  if (password.length < 8) {
    return { success: false, error: "La contrasena debe tener al menos 8 caracteres." }
  }

  const admin = createAdminClient()

  // 1) Crear usuario en Auth (el trigger handle_new_user creara el perfil)
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre, id_rol },
  })

  if (error || !data?.user) {
    return { success: false, error: error?.message ?? "Error creando usuario." }
  }

  // 2) Asegurar nombre y rol en `usuarios` (por si el trigger no leyo el metadata)
  const supabaseAdminDb = admin
  const { error: profileErr } = await supabaseAdminDb
    .from("usuarios")
    .update({ nombre, id_rol, activo: true })
    .eq("id_usuario", data.user.id)

  if (profileErr) {
    return { success: false, error: profileErr.message }
  }

  revalidatePath("/usuarios")
  return { success: true }
}

export async function updateUser(
  id_usuario: string,
  formData: FormData
) {
  await requireAdmin()

  const nombre = (formData.get("nombre") as string | null)?.trim() ?? ""
  const id_rol = parseInt((formData.get("id_rol") as string) || "0", 10)
  const activo = formData.get("activo") === "true"

  if (!nombre || !id_rol) {
    return { success: false, error: "Nombre y rol son obligatorios." }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from("usuarios")
    .update({ nombre, id_rol, activo })
    .eq("id_usuario", id_usuario)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/usuarios")
  return { success: true }
}

export async function setUserActive(id_usuario: string, activo: boolean) {
  await requireAdmin()
  const admin = createAdminClient()
  const { error } = await admin
    .from("usuarios")
    .update({ activo })
    .eq("id_usuario", id_usuario)

  if (error) return { success: false, error: error.message }
  revalidatePath("/usuarios")
  return { success: true }
}

export async function resetUserPassword(id_usuario: string, newPassword: string) {
  await requireAdmin()
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "La contrasena debe tener al menos 8 caracteres." }
  }
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(id_usuario, {
    password: newPassword,
  })
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function deleteUser(id_usuario: string) {
  await requireAdmin()
  const admin = createAdminClient()
  // Eliminar de auth.users (cascade en `usuarios` por la FK)
  const { error } = await admin.auth.admin.deleteUser(id_usuario)
  if (error) return { success: false, error: error.message }
  revalidatePath("/usuarios")
  return { success: true }
}
