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
        serie_factura,
        numero_factura,
        precio_neto,
        iva,
        total,
        proveedores (nombre, nit),
        detalle_compras (
          cantidad, precio_unitario, subtotal,
          productos (nombre, codigo, marca, categorias (nombre))
        )
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
        serie_factura: c.serie_factura || "--",
        invoice: c.numero_factura || "--",
        precio_neto: c.precio_neto,
        iva: c.iva,
        items: itemsCount,
        total: c.total,
        detalles: c.detalle_compras || [],
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
      .select("id_producto, codigo, nombre, descripcion, id_categoria, subcategoria, unidad_medida, marca, precio_compra, precio_venta");
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
  id_proveedor?: number;
  nuevo_proveedor_nombre?: string;
  nuevo_proveedor_nit?: string;
  serie_factura?: string | null;
  numero_factura?: string | null;
  total: number;
  precio_neto: number;
  iva: number;
  detalles: {
    id_producto?: number;
    nombre: string;
    descripcion?: string;
    id_categoria?: number;
    nuevaCategoria?: string;
    subcategoria?: string;
    unidad_medida?: string;
    marca?: string;
    precio_compra: number;
    precio_venta: number;
    cantidad: number;
    subtotal: number;
    numero_lote?: string;
    fecha_vencimiento?: string | null;
  }[];
}) {
  const profile = await requireUser();
  const supabase = await createClient();

  try {
    let provId = data.id_proveedor;
    let provRevalidated = false;

    if (!provId && data.nuevo_proveedor_nombre) {
      const { data: newProv, error: provErr } = await supabase
        .from("proveedores")
        .insert([{ 
          nombre: data.nuevo_proveedor_nombre, 
          nit: data.nuevo_proveedor_nit || null 
        }])
        .select()
        .single();
      if (provErr) throw new Error(`Error creando proveedor: ${provErr.message}`);
      provId = newProv.id_proveedor;
      provRevalidated = true;
    }

    if (!provId) throw new Error("Debe seleccionar o crear un proveedor");

    if (data.numero_factura) {
      const { data: existingPurchases, error: checkErr } = await supabase
        .from("compras")
        .select("id_compra, serie_factura")
        .eq("id_proveedor", provId)
        .eq("numero_factura", data.numero_factura);
        
      if (!checkErr && existingPurchases && existingPurchases.length > 0) {
        const isDuplicate = existingPurchases.some(
          p => (p.serie_factura || "") === (data.serie_factura || "")
        );
        if (isDuplicate) {
          throw new Error(`La factura (Serie: ${data.serie_factura || "N/A"} - Doc: ${data.numero_factura}) ya fue registrada para este proveedor. No se puede duplicar.`);
        }
      }
    }

    const { data: compraData, error: compraError } = await supabase
      .from("compras")
      .insert([{
        id_proveedor: provId,
        serie_factura: data.serie_factura || null,
        numero_factura: data.numero_factura || null,
        total: data.total,
        precio_neto: data.precio_neto,
        iva: data.iva,
        id_usuario: profile.id_usuario,
      }])
      .select()
      .single();

    if (compraError) throw new Error(`Error creando compra: ${compraError.message}`);
    const id_compra = compraData.id_compra;

    let categoriaRevalidated = false;

    const detallesToInsert = [];
    const lotesToInsert = [];

    for (let i = 0; i < data.detalles.length; i++) {
      const d = data.detalles[i];
      let catId = d.id_categoria;

      if (d.nuevaCategoria) {
        const { data: newCat, error: catErr } = await supabase
          .from("categorias")
          .insert([{ nombre: d.nuevaCategoria, descripcion: d.descripcion || null }])
          .select()
          .single();
        if (catErr) throw new Error(`Error creando categoría: ${catErr.message}`);
        catId = newCat.id_categoria;
        categoriaRevalidated = true;
      }

      let prodId = d.id_producto;

      if (!prodId) {
        if (!d.codigo) throw new Error(`El código del producto es obligatorio para: ${d.nombre}`);
        
        const { data: existingProd } = await supabase
          .from("productos")
          .select("id_producto")
          .eq("codigo", d.codigo)
          .maybeSingle();

        if (existingProd) throw new Error(`El código de producto ${d.codigo} ya existe en el sistema.`);

        const { data: newProd, error: prodErr } = await supabase
          .from("productos")
          .insert([{
            codigo: d.codigo,
            nombre: d.nombre,
            descripcion: d.descripcion || null,
            id_categoria: catId || null,
            subcategoria: d.subcategoria || null,
            unidad_medida: d.unidad_medida || null,
            marca: d.marca || null,
            precio_compra: d.precio_compra,
            precio_venta: d.precio_venta,
          }])
          .select()
          .single();
        if (prodErr) throw new Error(`Error creando producto: ${prodErr.message}`);
        prodId = newProd.id_producto;
      } else {
        const { error: updErr } = await supabase
          .from("productos")
          .update({
            nombre: d.nombre,
            descripcion: d.descripcion || null,
            id_categoria: catId || null,
            subcategoria: d.subcategoria || null,
            unidad_medida: d.unidad_medida || null,
            marca: d.marca || null,
            precio_compra: d.precio_compra,
            precio_venta: d.precio_venta,
          })
          .eq("id_producto", prodId);
        if (updErr) throw new Error(`Error actualizando producto: ${updErr.message}`);
      }

      detallesToInsert.push({
        id_compra,
        id_producto: prodId,
        cantidad: d.cantidad,
        precio_unitario: d.precio_compra,
        subtotal: d.subtotal,
      });

      lotesToInsert.push({
        id_producto: prodId,
        numero_lote: d.numero_lote || `L-${id_compra}-${i + 1}`,
        fecha_vencimiento: d.fecha_vencimiento || null,
        stock_actual: d.cantidad,
      });
    }

    const { error: detallesError } = await supabase.from("detalle_compras").insert(detallesToInsert);
    if (detallesError) throw new Error(`Error creando detalles: ${detallesError.message}`);

    const { error: lotesError } = await supabase.from("lotes").insert(lotesToInsert);
    if (lotesError) throw new Error(`Error creando lotes: ${lotesError.message}`);

    revalidateTag("inventario", "default");
    revalidateTag("movimientos", "default");
    revalidateTag("finanzas", "default");
    revalidateTag("dashboard", "default");
    if (categoriaRevalidated) revalidateTag("categorias", "default");
    if (provRevalidated) revalidateTag("proveedores", "default");

    return { success: true, id_compra };
  } catch (error: any) {
    console.error("Error en createPurchase:", error);
    return { success: false, error: error.message };
  }
}
