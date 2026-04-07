"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getClients() {
  const supabase = createClient();

  const { data: clientes, error } = await supabase
    .from("clientes")
    .select(`
      *,
      ventas (
        id_venta,
        fecha,
        total,
        estado
      )
    `);

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }

  return clientes.map((cliente: any) => {
    const ventasCompletadas = cliente.ventas ? cliente.ventas.filter((v: any) => v.estado === 'Completada' || v.estado === 'Pendiente') : [];
    const totalCompras = ventasCompletadas.length;
    const lastPurchase = ventasCompletadas.length > 0 
      ? new Date(Math.max(...ventasCompletadas.map((v: any) => new Date(v.fecha).getTime()))).toISOString().split('T')[0]
      : '--';
    
    // Simplification for balance: assuming 'Pendiente' means not paid
    const ventasPendientes = cliente.ventas ? cliente.ventas.filter((v: any) => v.estado === 'Pendiente') : [];
    const balance = ventasPendientes.reduce((sum: number, v: any) => sum + v.total, 0);

    return {
      id: `C${cliente.id_cliente.toString().padStart(3, '0')}`,
      raw_id: cliente.id_cliente,
      name: cliente.nombre,
      nit: cliente.nit || "C/F",
      type: cliente.tipo_cliente || "Regular",
      phone: cliente.telefono || "--",
      address: cliente.direccion || "--",
      purchases: totalCompras,
      balance: balance,
      lastPurchase: lastPurchase,
      status: balance > 0 ? "Con Credito" : "Activo" // simplified status
    };
  });
}

export async function addClient(formData: FormData) {
  const supabase = createClient();
  
  const nombre = formData.get("nombre") as string;
  const nit = formData.get("nit") as string;
  const tipo_cliente = formData.get("tipo_cliente") as string;
  const telefono = formData.get("telefono") as string;
  const direccion = formData.get("direccion") as string;

  const { data, error } = await supabase
    .from("clientes")
    .insert([
      {
        nombre,
        nit: nit || null,
        tipo_cliente: tipo_cliente || null,
        telefono: telefono || null,
        direccion: direccion || null
      }
    ])
    .select();

  if (error) {
    console.error("Error adding client:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/clientes");
  return { success: true, data };
}

export async function updateClient(id: number, formData: FormData) {
  const supabase = createClient();
  
  const nombre = formData.get("nombre") as string;
  const nit = formData.get("nit") as string;
  const tipo_cliente = formData.get("tipo_cliente") as string;
  const telefono = formData.get("telefono") as string;
  const direccion = formData.get("direccion") as string;

  const { data, error } = await supabase
    .from("clientes")
    .update({
      nombre,
      nit: nit || null,
      tipo_cliente: tipo_cliente || null,
      telefono: telefono || null,
      direccion: direccion || null
    })
    .eq("id_cliente", id)
    .select();

  if (error) {
    console.error("Error updating client:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/clientes");
  return { success: true, data };
}

export async function deleteClient(id: number) {
  const supabase = createClient();

  const { error } = await supabase
    .from("clientes")
    .delete()
    .eq("id_cliente", id);

  if (error) {
    console.error("Error deleting client:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/clientes");
  return { success: true };
}