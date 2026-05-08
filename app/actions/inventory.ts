"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  const supabase = await createClient();

  const { data: productos, error } = await supabase
    .from("productos")
    .select(`
      *,
      categorias (nombre),
      lotes (stock_actual, numero_lote, fecha_vencimiento)
    `);

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  // Calculate total stock and status for each product
  const formattedProducts = productos.map((product) => {
    // Sum all lotes stock
    const totalStock = product.lotes ? product.lotes.reduce((sum: number, lote: any) => sum + (lote.stock_actual || 0), 0) : 0;
    
    // Determine status
    let status = "Normal";
    if (totalStock === 0) status = "Agotado";
    else if (totalStock <= product.stock_minimo) status = "Critico";
    else if (totalStock <= product.stock_minimo * 1.5) status = "Bajo";

    return {
      no: product.id_producto,
      code: product.codigo,
      name: product.nombre,
      desc: product.categorias?.nombre || "--",
      supplier: "--", // Relacion no directa desde productos en schema actual
      invoice: "--",
      qty: totalStock,
      price: product.precio_compra,
      precio_venta: product.precio_venta,
      stock_minimo: product.stock_minimo,
      total: totalStock * product.precio_compra,
      status: status
    };
  });

  return formattedProducts;
}

export async function addProduct(formData: FormData) {
  const supabase = await createClient();
  
  const codigo = formData.get("codigo") as string;
  const nombre = formData.get("nombre") as string;
  const precio_compra = parseFloat(formData.get("precio_compra") as string);
  const precio_venta = parseFloat(formData.get("precio_venta") as string);
  const stock_minimo = parseInt(formData.get("stock_minimo") as string);

  const { data, error } = await supabase
    .from("productos")
    .insert([
      {
        codigo,
        nombre,
        precio_compra,
        precio_venta,
        stock_minimo,
      }
    ])
    .select();

  if (error) {
    console.error("Error adding product:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/inventario");
  return { success: true, data };
}

export async function deleteProduct(id: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id_producto", id);

  if (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/inventario");
  return { success: true };
}

export async function updateProduct(id: number, formData: FormData) {
  const supabase = await createClient();
  
  const codigo = formData.get("codigo") as string;
  const nombre = formData.get("nombre") as string;
  const precio_compra = parseFloat(formData.get("precio_compra") as string);
  const precio_venta = parseFloat(formData.get("precio_venta") as string);
  const stock_minimo = parseInt(formData.get("stock_minimo") as string);

  const { data, error } = await supabase
    .from("productos")
    .update({
      codigo,
      nombre,
      precio_compra,
      precio_venta,
      stock_minimo,
    })
    .eq("id_producto", id)
    .select();

  if (error) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/inventario");
  return { success: true, data };
}
