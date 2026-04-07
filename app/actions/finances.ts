"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getTransactions() {
  const supabase = createClient();

  const { data: ventas, error: errV } = await supabase
    .from("ventas")
    .select(`
      id_venta,
      fecha,
      total,
      estado,
      clientes ( nombre )
    `);

  const { data: pagos, error: errP } = await supabase
    .from("pagos_proveedores")
    .select(`
      id_pago,
      fecha_pago,
      monto_pagado,
      metodo_pago,
      referencia,
      compras ( id_proveedor, proveedores ( nombre ) )
    `);

  if (errV || errP) {
    console.error("Error fetching transactions:", errV, errP);
    return [];
  }

  const transactions = [];

  if (ventas) {
    ventas.forEach((v: any) => {
      transactions.push({
        id: `TX-V${v.id_venta.toString().padStart(4, '0')}`,
        raw_date: v.fecha,
        date: new Date(v.fecha).toISOString().split('T')[0],
        type: "Ingreso",
        concept: `Venta V-${v.id_venta} - ${v.clientes?.nombre || "C/F"}`,
        amount: v.total,
        method: "Efectivo", // default for now, could be added to ventas schema
        ref: `V-${v.id_venta}`
      });
    });
  }

  if (pagos) {
    pagos.forEach((p: any) => {
      // Proveedor name extraction is somewhat nested due to Supabase relationships
      const proveedorName = p.compras?.proveedores?.nombre || "Proveedor";
      
      transactions.push({
        id: `TX-P${p.id_pago.toString().padStart(4, '0')}`,
        raw_date: p.fecha_pago,
        date: new Date(p.fecha_pago).toISOString().split('T')[0],
        type: "Egreso",
        concept: `Pago Proveedor ${proveedorName}`,
        amount: p.monto_pagado,
        method: p.metodo_pago,
        ref: p.referencia || `PG-${p.id_pago}`
      });
    });
  }

  transactions.sort((a, b) => new Date(b.raw_date).getTime() - new Date(a.raw_date).getTime());

  return transactions;
}

export async function getCashClosings() {
  const supabase = createClient();

  const { data: cierres, error } = await supabase
    .from("cierres_caja")
    .select("*")
    .order("fecha_cierre", { ascending: false });

  if (error) {
    console.error("Error fetching cash closings:", error);
    return [];
  }

  return cierres.map((c: any) => ({
    id: c.id_cierre,
    date: new Date(c.fecha_cierre).toISOString().split('T')[0],
    opening: c.saldo_final - c.total_ventas + c.total_egresos, // Estimated opening if not explicitly saved
    sales: c.total_ventas,
    expenses: c.total_egresos,
    closing: c.saldo_final,
    status: "Cerrado"
  }));
}

export async function closeDailyCash() {
  const supabase = createClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Get today's sales
  const { data: ventas } = await supabase
    .from("ventas")
    .select("total")
    .gte("fecha", todayStart.toISOString())
    .lte("fecha", todayEnd.toISOString());

  // Get today's expenses
  const { data: pagos } = await supabase
    .from("pagos_proveedores")
    .select("monto_pagado")
    .gte("fecha_pago", todayStart.toISOString())
    .lte("fecha_pago", todayEnd.toISOString());

  const total_ventas = ventas?.reduce((sum, v) => sum + v.total, 0) || 0;
  const total_egresos = pagos?.reduce((sum, p) => sum + p.monto_pagado, 0) || 0;
  
  // Previous closing to calculate new closing correctly
  const { data: lastCierre } = await supabase
    .from("cierres_caja")
    .select("saldo_final")
    .order("fecha_cierre", { ascending: false })
    .limit(1);

  const baseSaldo = lastCierre && lastCierre.length > 0 ? lastCierre[0].saldo_final : 0;
  const saldo_final = baseSaldo + total_ventas - total_egresos;
  const utilidad_bruta = total_ventas; // Simplified for now without cost of goods sold

  const { data, error } = await supabase
    .from("cierres_caja")
    .insert([
      {
        total_ventas,
        total_egresos,
        utilidad_bruta,
        saldo_final,
        observaciones: "Cierre diario automatizado"
      }
    ])
    .select();

  if (error) {
    console.error("Error closing cash:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/finanzas");
  return { success: true, data };
}