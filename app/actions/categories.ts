"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateTag, unstable_cache } from "next/cache";

export const getCategories = unstable_cache(
  async () => {
    const supabase = createAdminClient();

    const { data: categorias, error } = await supabase
      .from("categorias")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    return categorias;
  },
  ["get-categories"],
  { revalidate: 120, tags: ["categorias"] }
);

export async function addCategory(formData: FormData) {
  const supabase = await createClient();

  const nombre = formData.get("nombre") as string;
  const descripcion = formData.get("descripcion") as string;

  const { data, error } = await supabase
    .from("categorias")
    .insert([{ nombre, descripcion }])
    .select();

  if (error) {
    console.error("Error adding category:", error);
    return { success: false, error: error.message };
  }

  revalidateTag("categorias", "default");
  revalidateTag("inventario", "default"); // Porque los productos usan categorías
  return { success: true, data };
}

export async function updateCategory(id: number, formData: FormData) {
  const supabase = await createClient();

  const nombre = formData.get("nombre") as string;
  const descripcion = formData.get("descripcion") as string;

  const { data, error } = await supabase
    .from("categorias")
    .update({ nombre, descripcion })
    .eq("id_categoria", id)
    .select();

  if (error) {
    console.error("Error updating category:", error);
    return { success: false, error: error.message };
  }

  revalidateTag("categorias", "default");
  revalidateTag("inventario", "default");
  return { success: true, data };
}

export async function deleteCategory(id: number) {
  const supabase = await createClient();

  // Ojo: Si hay productos usando esta categoría, la DB podría lanzar un error de Foreign Key Constraint.
  const { error } = await supabase
    .from("categorias")
    .delete()
    .eq("id_categoria", id);

  if (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }

  revalidateTag("categorias", "default");
  revalidateTag("inventario", "default");
  return { success: true };
}
