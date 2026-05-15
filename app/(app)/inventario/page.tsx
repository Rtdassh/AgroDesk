import { getProducts } from "@/app/actions/inventory"
import { InventarioClient } from "./inventario-client"



export default async function InventarioPage() {
  const products = await getProducts()
  
  return <InventarioClient initialProducts={products} />
}
