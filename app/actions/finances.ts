"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";
import { revalidateTag, unstable_cache } from "next/cache";

export const getTransactions = unstable_cache(
  async () => {
    const supabase = createAdminClient();

    const [ventasRes, pagosRes] = await Promise.all([
      supabase.from("ventas").select(`
        id_venta, fecha, total, estado,
        clientes ( nombre )
      `),
      supabase.from("pagos_proveedores").select(`
        id_pago, fecha_pago, monto_pagado, metodo_pago, referencia,
        compras ( id_proveedor, proveedores ( nombre ) )
      `),
    ]);

    const { data: ventas, error: errV } = ventasRes;
    const { data: pagos, error: errP } = pagosRes;

    if (errV || errP) {
      console.error("Error fetching transactions:", errV, errP);
      return [];
    }

    const transactions: any[] = [];

    ventas?.forEach((v: any) => {
      transactions.push({
        id: `TX-V${v.id_venta.toString().padStart(4, "0")}`,
        raw_date: v.fecha,
        date: new Date(v.fecha).toISOString().split("T")[0],
        type: "Ingreso",
        concept: `Venta V-${v.id_venta} - ${v.clientes?.nombre || "C/F"}`,
        amount: v.total,
        method: "Efectivo",
        ref: `V-${v.id_venta}`,
      });
    });

    pagos?.forEach((p: any) => {
      const proveedorName = p.compras?.proveedores?.nombre || "Proveedor";
      transactions.push({
        id: `TX-P${p.id_pago.toString().padStart(4, "0")}`,
        raw_date: p.fecha_pago,
        date: new Date(p.fecha_pago).toISOString().split("T")[0],
        type: "Egreso",
        concept: `Pago Proveedor ${proveedorName}`,
        amount: p.monto_pagado,
        method: p.metodo_pago,
        ref: p.referencia || `PG-${p.id_pago}`,
      });
    });

    transactions.sort(
      (a, b) => new Date(b.raw_date).getTime() - new Date(a.raw_date).getTime()
    );
    return transactions;
  },
  ["get-transactions"],
  { revalidate: 60, tags: ["finanzas"] }
);

export const getCashClosings = unstable_cache(
  async () => {
    const supabase = createAdminClient();

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
      date: new Date(c.fecha_cierre).toISOString().split("T")[0],
      opening: c.saldo_final - c.total_ventas + c.total_egresos,
      sales: c.total_ventas,
      expenses: c.total_egresos,
      closing: c.saldo_final,
      status: "Cerrado",
    }));
  },
  ["get-cash-closings"],
  { revalidate: 60, tags: ["finanzas"] }
);

export async function closeDailyCash() {
  const profile = await requireUser();
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [ventasRes, pagosRes] = await Promise.all([
    supabase.from("ventas").select("total")
      .gte("fecha", todayStart.toISOString())
      .lte("fecha", todayEnd.toISOString()),
    supabase.from("pagos_proveedores").select("monto_pagado")
      .gte("fecha_pago", todayStart.toISOString())
      .lte("fecha_pago", todayEnd.toISOString()),
  ]);

  const total_ventas = ventasRes.data?.reduce((sum, v) => sum + v.total, 0) || 0;
  const total_egresos = pagosRes.data?.reduce((sum, p) => sum + p.monto_pagado, 0) || 0;

  const { data: lastCierre } = await supabase
    .from("cierres_caja")
    .select("saldo_final")
    .order("fecha_cierre", { ascending: false })
    .limit(1);

  const baseSaldo =
    lastCierre && lastCierre.length > 0 ? lastCierre[0].saldo_final : 0;
  const saldo_final = baseSaldo + total_ventas - total_egresos;
  const utilidad_bruta = total_ventas;

  const { data, error } = await supabase
    .from("cierres_caja")
    .insert([{
      total_ventas,
      total_egresos,
      utilidad_bruta,
      saldo_final,
      observaciones: "Cierre diario automatizado",
      id_usuario: profile.id_usuario,
    }])
    .select();

  if (error) {
    console.error("Error closing cash:", error);
    return { success: false, error: error.message };
  }

  revalidateTag("finanzas", "default");
  revalidateTag("dashboard", "default");
  return { success: true, data };
}