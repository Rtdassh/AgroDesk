"use server"

import { revalidateTag } from "next/cache"
import { unstable_cache } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth"

export type CompanyConfig = {
  company: string
  nit: string | null
  address: string | null
  phone: string | null
  serie: string | null
  next_invoice: string | null
  iva: number
  currency: string
}

const DEFAULT_CONFIG: CompanyConfig = {
  company: "AgroDesk",
  nit: null,
  address: null,
  phone: null,
  serie: "A",
  next_invoice: "FAC-0001",
  iva: 12,
  currency: "GTQ",
}

const _getConfig = async (): Promise<CompanyConfig> => {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("configuracion_empresa")
    .select("*")
    .eq("id", 1)
    .maybeSingle()

  if (error || !data) return DEFAULT_CONFIG

  return {
    company: data.company ?? "AgroDesk",
    nit: data.nit ?? null,
    address: data.address ?? null,
    phone: data.phone ?? null,
    serie: data.serie ?? "A",
    next_invoice: data.next_invoice ?? "FAC-0001",
    iva: Number(data.iva ?? 12),
    currency: data.currency ?? "GTQ",
  }
}

export const getConfig = unstable_cache(_getConfig, ["get-config"], {
  revalidate: 120,
  tags: ["configuracion"],
})

export async function saveConfig(formData: FormData) {
  await requireAdmin()

  const payload = {
    company: ((formData.get("company") as string) ?? "").trim(),
    nit: ((formData.get("nit") as string) ?? "").trim() || null,
    address: ((formData.get("address") as string) ?? "").trim() || null,
    phone: ((formData.get("phone") as string) ?? "").trim() || null,
    serie: ((formData.get("serie") as string) ?? "").trim() || null,
    next_invoice: ((formData.get("next_invoice") as string) ?? "").trim() || null,
    iva: parseFloat(((formData.get("iva") as string) ?? "0").replace(",", ".")) || 0,
    currency: ((formData.get("currency") as string) ?? "GTQ").trim(),
    updated_at: new Date().toISOString(),
  }

  if (!payload.company) {
    return { success: false, error: "El nombre de la empresa es obligatorio." }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("configuracion_empresa")
    .upsert({ id: 1, ...payload })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidateTag("configuracion", "default")
  return { success: true }
}
