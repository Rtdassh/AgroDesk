import { getSales, getClientesForSale, getProductosForSale } from "@/app/actions/sales"
import { VentasClient } from "./ventas-client"

export const dynamic = 'force-dynamic'

export default async function VentasPage() {
  const [sales, clientes, productos] = await Promise.all([
    getSales(),
    getClientesForSale(),
    getProductosForSale()
  ])
  
  return <VentasClient initialSales={sales} initialClientes={clientes} initialProductos={productos} />
}
