"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";
import { revalidateTag, unstable_cache } from "next/cache";

export const getTransactionsV2 = async () => {
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
        status: v.estado,
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
  };

export const getCashClosingsV2 = async () => {
    const supabase = createAdminClient();

    const { data: cierres, error } = await supabase
      .from("cierres_caja")
      .select("*")
      .order("fecha_cierre", { ascending: false });

    if (error) {
      console.error("Error fetching cash closings:", error);
      return [];
    }

    const toGuatemalaTime = (d: string) => {
      if (!d) return "--";
      const dateStr = d.includes("T") ? d : d.replace(" ", "T");
      const withZ = dateStr.includes("Z") ? dateStr : dateStr + "Z";
      return new Date(withZ).toLocaleString("es-GT", { timeZone: "America/Guatemala" });
    };

    return cierres.map((c: any) => ({
      id: c.id_cierre,
      raw_apertura: c.fecha_apertura,
      fecha_apertura: toGuatemalaTime(c.fecha_apertura),
      date: toGuatemalaTime(c.fecha_cierre),
      opening: c.monto_inicial || 0,
      sales: c.total_ventas,
      expenses: c.total_egresos,
      expected: c.monto_esperado || 0,
      real: c.monto_real || 0,
      difference: c.diferencia || 0,
      status: c.estado || "Cerrada",
    }));
  };

export async function openCashSession(monto_inicial: number) {
  const profile = await requireUser();
  const supabase = await createClient();

  // Verificamos si ya hay una caja abierta
  const { data: openSessions, error: openErr } = await supabase
    .from("cierres_caja")
    .select("id_cierre")
    .eq("estado", "Abierta")
    .limit(1);

  if (openErr) return { success: false, error: openErr.message };
  if (openSessions && openSessions.length > 0) return { success: false, error: "Ya hay una caja abierta." };

  const { data, error } = await supabase
    .from("cierres_caja")
    .insert([{
      monto_inicial,
      estado: "Abierta",
      id_usuario: profile.id_usuario,
      saldo_final: 0,
      total_ventas: 0,
      total_egresos: 0,
      utilidad_bruta: 0,
      monto_esperado: 0,
      monto_real: 0,
      diferencia: 0
    }])
    .select();

  if (error) return { success: false, error: error.message };

  revalidateTag("finanzas", "default");
  revalidateTag("dashboard", "default");
  return { success: true, data };
}

export async function closeDailyCashV2(monto_real: number) {
  const profile = await requireUser();
  const supabase = await createClient();

  // Obtener la caja abierta actual (si hay multiples por error previo, tomamos la más antigua)
  const { data: openSessions, error: getErr } = await supabase
    .from("cierres_caja")
    .select("*")
    .eq("estado", "Abierta")
    .order("fecha_apertura", { ascending: true })
    .limit(1);

  if (getErr || !openSessions || openSessions.length === 0) {
    return { success: false, error: "No hay una caja abierta para cerrar." };
  }

  const openSession = openSessions[0];

  const startTime = openSession.fecha_apertura;
  const endTime = new Date().toISOString();

  const [ventasRes, pagosRes] = await Promise.all([
    supabase.from("ventas").select("total")
      .eq("estado", "Completada")
      .gte("fecha", startTime)
      .lte("fecha", endTime),
    supabase.from("pagos_proveedores").select("monto_pagado")
      .eq("metodo_pago", "Efectivo")
      .gte("fecha_pago", startTime)
      .lte("fecha_pago", endTime),
  ]);

  const total_ventas = ventasRes.data?.reduce((sum, v) => sum + v.total, 0) || 0;
  const total_egresos = pagosRes.data?.reduce((sum, p) => sum + p.monto_pagado, 0) || 0;

  const monto_esperado = Number(openSession.monto_inicial) + total_ventas - total_egresos;
  const diferencia = monto_real - monto_esperado;

  const { data, error } = await supabase
    .from("cierres_caja")
    .update({
      total_ventas,
      total_egresos,
      utilidad_bruta: total_ventas,
      saldo_final: monto_real,
      monto_esperado,
      monto_real,
      diferencia,
      fecha_cierre: new Date().toISOString(),
      estado: "Cerrada",
    })
    .eq("id_cierre", openSession.id_cierre)
    .select();

  if (error) {
    console.error("Error closing cash:", error);
    return { success: false, error: error.message };
  }

  revalidateTag("finanzas", "default");
  revalidateTag("dashboard", "default");
  return { success: true, data };
}