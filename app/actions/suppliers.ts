"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateTag, unstable_cache } from "next/cache";

export const getSuppliers = unstable_cache(
  async () => {
    const supabase = createAdminClient();

    const { data: proveedores, error } = await supabase
      .from("proveedores")
      .select(`
        *,
        compras (
          id_compra, fecha, total,
          pagos_proveedores ( monto_pagado )
        )
      `);

    if (error) {
      console.error("Error fetching suppliers:", error);
      return [];
    }

    return proveedores.map((proveedor: any) => {
      let pending = 0;
      let lastOrder = "--";

      if (proveedor.compras && proveedor.compras.length > 0) {
        lastOrder = new Date(
          Math.max(...proveedor.compras.map((c: any) => new Date(c.fecha).getTime()))
        )
          .toISOString()
          .split("T")[0];

        proveedor.compras.forEach((compra: any) => {
          const pagado = compra.pagos_proveedores
            ? compra.pagos_proveedores.reduce(
                (sum: number, p: any) => sum + p.monto_pagado,
                0
              )
            : 0;
          pending += compra.total - pagado;
        });
      }

      return {
        id: `PR${proveedor.id_proveedor.toString().padStart(3, "0")}`,
        raw_id: proveedor.id_proveedor,
        name: proveedor.nombre,
        nit: proveedor.nit || "--",
        contact: proveedor.contacto || "--",
        phone: proveedor.telefono || "--",
        address: proveedor.direccion || "--",
        email: "--",
        products: 0,
        pending,
        lastOrder,
        status: "Activo",
      };
    });
  },
  ["get-suppliers"],
  { revalidate: 120, tags: ["proveedores"] }
);

export async function addSupplier(formData: FormData) {
  const supabase = await createClient();

  const nombre = formData.get("nombre") as string;
  const nit = formData.get("nit") as string;
  const contacto = formData.get("contacto") as string;
  const telefono = formData.get("telefono") as string;
  const direccion = formData.get("direccion") as string;

  const { data, error } = await supabase
    .from("proveedores")
    .insert([{
      nombre,
      nit: nit || null,
      contacto: contacto || null,
      telefono: telefono || null,
      direccion: direccion || null,
    }])
    .select();

  if (error) {
    console.error("Error adding supplier:", error);
    return { success: false, error: error.message };
  }

  revalidateTag("proveedores", "default");
  return { success: true, data };
}

export async function updateSupplier(id: number, formData: FormData) {
  const supabase = await createClient();

  const nombre = formData.get("nombre") as string;
  const nit = formData.get("nit") as string;
  const contacto = formData.get("contacto") as string;
  const telefono = formData.get("telefono") as string;
  const direccion = formData.get("direccion") as string;

  const { data, error } = await supabase
    .from("proveedores")
    .update({
      nombre,
      nit: nit || null,
      contacto: contacto || null,
      telefono: telefono || null,
      direccion: direccion || null,
    })
    .eq("id_proveedor", id)
    .select();

  if (error) {
    console.error("Error updating supplier:", error);
    return { success: false, error: error.message };
  }

  revalidateTag("proveedores", "default");
  return { success: true, data };
}

export async function deleteSupplier(id: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("proveedores")
    .delete()
    .eq("id_proveedor", id);

  if (error) {
    console.error("Error deleting supplier:", error);
    return { success: false, error: error.message };
  }

  revalidateTag("proveedores", "default");
  return { success: true };
}