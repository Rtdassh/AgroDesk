"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";
import { revalidateTag, unstable_cache } from "next/cache";

export const getMovements = unstable_cache(
  async () => {
    const supabase = createAdminClient();

    const [entradasRes, salidasRes] = await Promise.all([
      supabase.from("detalle_compras").select(`
        id_detalle_compra, cantidad,
        compras ( id_compra, fecha ),
        productos ( id_producto, codigo, nombre )
      `),
      supabase.from("detalle_ventas").select(`
        id_detalle_venta, cantidad,
        ventas ( id_venta, fecha ),
        productos ( id_producto, codigo, nombre )
      `),
    ]);

    const { data: entradas, error: errE } = entradasRes;
    const { data: salidas, error: errS } = salidasRes;

    if (errE || errS) {
      console.error("Error fetching movements:", errE, errS);
      return [];
    }

    const movements: any[] = [];

    entradas?.forEach((e: any) => {
      movements.push({
        id: `ENT-${e.id_detalle_compra.toString().padStart(4, "0")}`,
        raw_date: e.compras?.fecha,
        date: new Date(e.compras?.fecha).toLocaleString(),
        type: "Entrada",
        product: e.productos?.nombre || "Desconocido",
        code: e.productos?.codigo || "--",
        qty: e.cantidad,
        prev: "--",
        current: "--",
        reason: `Compra a proveedor (C-${e.compras?.id_compra})`,
      });
    });

    salidas?.forEach((s: any) => {
      movements.push({
        id: `SAL-${s.id_detalle_venta.toString().padStart(4, "0")}`,
        raw_date: s.ventas?.fecha,
        date: new Date(s.ventas?.fecha).toLocaleString(),
        type: "Salida",
        product: s.productos?.nombre || "Desconocido",
        code: s.productos?.codigo || "--",
        qty: -s.cantidad,
        prev: "--",
        current: "--",
        reason: `Venta (V-${s.ventas?.id_venta})`,
      });
    });

    movements.sort(
      (a, b) => new Date(b.raw_date).getTime() - new Date(a.raw_date).getTime()
    );
    return movements;
  },
  ["get-movements"],
  { revalidate: 60, tags: ["movimientos"] }
);

export const getPurchases = unstable_cache(
  async () => {
    const supabase = createAdminClient();

    const { data: compras, error } = await supabase
      .from("compras")
      .select(`
        id_compra,
        fecha,
        numero_factura,
        total,
        proveedores (nombre, nit),
        detalle_compras (cantidad)
      `)
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error fetching purchases:", error);
      return [];
    }

    return compras.map((c: any) => {
      const itemsCount = c.detalle_compras?.reduce((sum: number, d: any) => sum + (d.cantidad || 0), 0) || 0;
      return {
        id: `C-${c.id_compra.toString().padStart(4, "0")}`,
        date: new Date(c.fecha).toLocaleString(),
        provider: c.proveedores?.nombre || "Desconocido",
        nit: c.proveedores?.nit || "--",
        invoice: c.numero_factura || "--",
        items: itemsCount,
        total: c.total,
      };
    });
  },
  ["get-purchases"],
  { revalidate: 60, tags: ["movimientos"] } // Usamos el mismo tag movimientos para revalidar
);

export const getProveedoresForPurchase = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("proveedores")
      .select("id_proveedor, nombre, nit");
    if (error) {
      console.error("Error fetching proveedores:", error);
      return [];
    }
    return data;
  },
  ["get-proveedores-for-purchase"],
  { revalidate: 120, tags: ["proveedores"] }
);

export const getProductosForPurchase = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("productos")
      .select("id_producto, codigo, nombre, precio_compra");
    if (error) {
      console.error("Error fetching productos:", error);
      return [];
    }
    return data;
  },
  ["get-productos-for-purchase"],
  { revalidate: 60, tags: ["inventario"] }
);

export async function createPurchase(data: {
  id_proveedor: number;
  numero_factura?: string | null;
  total: number;
  detalles: {
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    numero_lote?: string;
    fecha_vencimiento?: string | null;
  }[];
}) {
  const profile = await requireUser();
  const supabase = await createClient();

  try {
    const { data: compraData, error: compraError } = await supabase
      .from("compras")
      .insert([{
        id_proveedor: data.id_proveedor,
        numero_factura: data.numero_factura || null,
        total: data.total,
        id_usuario: profile.id_usuario,
      }])
      .select()
      .single();

    if (compraError) throw new Error(`Error creando compra: ${compraError.message}`);
    const id_compra = compraData.id_compra;

    const detallesToInsert = data.detalles.map((d) => ({
      id_compra,
      id_producto: d.id_producto,
      cantidad: d.cantidad,
      precio_unitario: d.precio_unitario,
      subtotal: d.subtotal,
    }));

    const { error: detallesError } = await supabase
      .from("detalle_compras")
      .insert(detallesToInsert);

    if (detallesError)
      throw new Error(`Error creando detalles: ${detallesError.message}`);

    const lotesToInsert = data.detalles.map((d, idx) => ({
      id_producto: d.id_producto,
      numero_lote: d.numero_lote || `L-${id_compra}-${idx + 1}`,
      fecha_vencimiento: d.fecha_vencimiento || null,
      stock_actual: d.cantidad,
    }));

    const { error: lotesError } = await supabase.from("lotes").insert(lotesToInsert);
    if (lotesError) throw new Error(`Error creando lotes: ${lotesError.message}`);

    revalidateTag("inventario", "default");
    revalidateTag("movimientos", "default");
    revalidateTag("finanzas", "default");
    revalidateTag("dashboard", "default");

    return { success: true, id_compra };
  } catch (error: any) {
    console.error("Error en createPurchase:", error);
    return { success: false, error: error.message };
  }
}
