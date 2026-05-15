import { getPurchases, getProveedoresForPurchase, getProductosForPurchase } from "@/app/actions/purchases"
import { ComprasClient } from "./compras-client"

export default async function ComprasPage() {
  const [purchases, proveedores, productos] = await Promise.all([
    getPurchases(),
    getProveedoresForPurchase(),
    getProductosForPurchase()
  ])
  
  return <ComprasClient initialPurchases={purchases} initialProveedores={proveedores} initialProductos={productos} />
}
