import { getCategories } from "@/app/actions/categories"
import { CategoriasClient } from "./categorias-client"

export default async function CategoriasPage() {
  const categories = await getCategories()
  
  return <CategoriasClient initialCategories={categories} />
}
