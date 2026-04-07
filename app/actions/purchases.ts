"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getMovements() {
  const supabase = createClient();

  const { data: entradas, error: errE } = await supabase
    .from("detalle_compras")
    .select(`
      id_detalle_compra,
      cantidad,
      compras ( id_compra, fecha ),
      productos ( id_producto, codigo, nombre )
    `);

  const { data: salidas, error: errS } = await supabase
    .from("detalle_ventas")
    .select(`
      id_detalle_venta,
      cantidad,
      ventas ( id_venta, fecha ),
      productos ( id_producto, codigo, nombre )
    `);

  if (errE || errS) {
    console.error("Error fetching movements:", errE, errS);
    return [];
  }

  const movements = [];

  if (entradas) {
    entradas.forEach((e: any) => {
      movements.push({
        id: `ENT-${e.id_detalle_compra.toString().padStart(4, '0')}`,
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
  }

  if (salidas) {
    salidas.forEach((s: any) => {
      movements.push({
        id: `SAL-${s.id_detalle_venta.toString().padStart(4, '0')}`,
        raw_date: s.ventas?.fecha,
        date: new Date(s.ventas?.fecha).toLocaleString(),
        type: "Salida",
        product: s.productos?.nombre || "Desconocido",
        code: s.productos?.codigo || "--",
        qty: -s.cantidad, // Negative for salidas
        prev: "--", 
        current: "--",
        reason: `Venta (V-${s.ventas?.id_venta})`,
      });
    });
  }

  // Sort descending by date
  movements.sort((a, b) => new Date(b.raw_date).getTime() - new Date(a.raw_date).getTime());

  return movements;
}