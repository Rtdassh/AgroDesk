"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type LoginState = {
  error?: string
}

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = (formData.get("email") as string | null)?.trim() ?? ""
  const password = (formData.get("password") as string | null) ?? ""
  const redirectTo = (formData.get("redirect") as string | null) ?? "/"

  if (!email || !password) {
    return { error: "Email y contrasena son obligatorios." }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return { error: "Credenciales invalidas." }
  }

  // Verificar que exista el perfil y este activo
  const { data: profile } = await supabase
    .from("usuarios")
    .select("activo")
    .eq("id_usuario", data.user.id)
    .maybeSingle()

  if (!profile) {
    await supabase.auth.signOut()
    return {
      error:
        "El usuario fue autenticado pero no tiene perfil asignado. Contacta al administrador.",
    }
  }

  if (!profile.activo) {
    await supabase.auth.signOut()
    return { error: "Tu cuenta esta desactivada. Contacta al administrador." }
  }

  redirect(redirectTo.startsWith("/") ? redirectTo : "/")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
