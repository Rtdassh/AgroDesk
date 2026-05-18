import { getPurchases, getProveedoresForPurchase, getProductosForPurchase } from "@/app/actions/purchases"
import { getCategories } from "@/app/actions/categories"

export const dynamic = "force-dynamic"
import { getCashClosingsV2 } from "@/app/actions/finances"
import { ComprasClient } from "./compras-client"

export default async function ComprasPage() {
  const [purchases, proveedores, productos, categorias, cashClosings] = await Promise.all([
    getPurchases(),
    getProveedoresForPurchase(),
    getProductosForPurchase(),
    getCategories(),
    getCashClosingsV2()
  ])
  
  const isCajaAbierta = cashClosings.some((c: any) => c.status === "Abierta")

  return <ComprasClient initialPurchases={purchases} initialProveedores={proveedores} initialProductos={productos} initialCategorias={categorias} isCajaAbierta={isCajaAbierta} />
}
