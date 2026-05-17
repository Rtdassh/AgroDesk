import { getPurchases, getProveedoresForPurchase, getProductosForPurchase } from "@/app/actions/purchases"
import { getCategories } from "@/app/actions/categories"
import { ComprasClient } from "./compras-client"

export default async function ComprasPage() {
  const [purchases, proveedores, productos, categorias] = await Promise.all([
    getPurchases(),
    getProveedoresForPurchase(),
    getProductosForPurchase(),
    getCategories()
  ])
  
  return <ComprasClient initialPurchases={purchases} initialProveedores={proveedores} initialProductos={productos} initialCategorias={categorias} />
}
