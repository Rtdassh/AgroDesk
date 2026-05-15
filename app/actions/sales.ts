"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";
import { revalidateTag, unstable_cache } from "next/cache";

// ─── Cached reads ─────────────────────────────────────────────────────────────
export const getSales = unstable_cache(
  async () => {
    const supabase = createAdminClient();

    const { data: ventas, error } = await supabase
      .from("ventas")
      .select(`
        id_venta, fecha, total, estado,
        clientes (nombre, nit)
      `)
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error fetching sales:", error);
      return [];
    }

    return ventas.map((venta: any) => ({
      id: `V-${venta.id_venta.toString().padStart(4, "0")}`,
      date: new Date(venta.fecha).toISOString().split("T")[0],
      client: venta.clientes?.nombre || "Consumidor Final",
      nit: venta.clientes?.nit || "C/F",
      items: 1,
      subtotal: venta.total,
      discount: 0,
      total: venta.total,
      payment: "Contado",
      status: venta.estado,
    }));
  },
  ["get-sales"],
  { revalidate: 60, tags: ["ventas"] }
);

export const getClientesForSale = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("clientes")
      .select("id_cliente, nombre, nit");

    if (error) {
      console.error("Error fetching clients:", error);
      return [];
    }
    return data;
  },
  ["get-clientes-for-sale"],
  { revalidate: 120, tags: ["clientes"] }
);

export const getProductosForSale = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("productos")
      .select(`
        id_producto, codigo, nombre, precio_venta,
        lotes (stock_actual)
      `);

    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }

    return data.map((p: any) => {
      const stock_disponible = p.lotes
        ? p.lotes.reduce((sum: number, l: any) => sum + (l.stock_actual || 0), 0)
        : 0;
      return {
        id_producto: p.id_producto,
        codigo: p.codigo,
        nombre: p.nombre,
        precio_venta: p.precio_venta,
        stock_disponible,
      };
    });
  },
  ["get-productos-for-sale"],
  { revalidate: 60, tags: ["inventario"] }
);

// ─── Mutation ─────────────────────────────────────────────────────────────────
export async function createSale(data: {
  id_cliente: number;
  total: number;
  detalles: {
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
}) {
  const profile = await requireUser();
  const supabase = await createClient();

  try {
    const { data: ventaData, error: ventaError } = await supabase
      .from("ventas")
      .insert([{
        id_cliente: data.id_cliente,
        total: data.total,
        estado: "Completada",
        id_usuario: profile.id_usuario,
      }])
      .select()
      .single();

    if (ventaError) throw new Error(`Error creando venta: ${ventaError.message}`);
    const id_venta = ventaData.id_venta;

    const detallesToInsert = data.detalles.map((d) => ({ id_venta, ...d }));
    const { error: detallesError } = await supabase
      .from("detalle_ventas")
      .insert(detallesToInsert);

    if (detallesError) throw new Error(`Error creando detalles: ${detallesError.message}`);

    // FEFO: primero expira, primero sale
    for (const detalle of data.detalles) {
      const { data: lotes, error: lotesError } = await supabase
        .from("lotes")
        .select("id_lote, stock_actual")
        .eq("id_producto", detalle.id_producto)
        .gt("stock_actual", 0)
        .order("fecha_vencimiento", { ascending: true });

      if (lotesError) throw new Error(`Error fetching lotes: ${lotesError.message}`);

      let remainingToDeduct = detalle.cantidad;
      for (const lote of lotes || []) {
        if (remainingToDeduct <= 0) break;
        const deductAmount = Math.min(lote.stock_actual, remainingToDeduct);
        const { error: updateError } = await supabase
          .from("lotes")
          .update({ stock_actual: lote.stock_actual - deductAmount })
          .eq("id_lote", lote.id_lote);

        if (updateError) throw new Error(`Error updating stock: ${updateError.message}`);
        remainingToDeduct -= deductAmount;
      }

      if (remainingToDeduct > 0) {
        console.warn(`Stock insufficient for product ${detalle.id_producto} during deduction`);
      }
    }

    const { data: lastComprobante } = await supabase
      .from("comprobantes")
      .select("id_comprobante")
      .order("id_comprobante", { ascending: false })
      .limit(1);

    const nextId = (lastComprobante?.[0]?.id_comprobante || 0) + 1;
    const correlativo = `FAC-${nextId.toString().padStart(6, "0")}`;

    const { error: compError } = await supabase
      .from("comprobantes")
      .insert([{ id_venta, tipo_comprobante: "Factura", serie: "A", correlativo }]);

    if (compError) console.error(`Error generando comprobante: ${compError.message}`);

    revalidateTag("ventas", "default");
    revalidateTag("inventario", "default");
    revalidateTag("dashboard", "default");

    return { success: true, id_venta };
  } catch (error: any) {
    console.error("Transaction failed:", error);
    return { success: false, error: error.message };
  }
}
