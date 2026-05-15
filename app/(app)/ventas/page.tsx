import { getSales, getClientesForSale, getProductosForSale } from "@/app/actions/sales"
import { VentasClient } from "./ventas-client"



export default async function VentasPage() {
  const [sales, clientes, productos] = await Promise.all([
    getSales(),
    getClientesForSale(),
    getProductosForSale()
  ])
  
  return <VentasClient initialSales={sales} initialClientes={clientes} initialProductos={productos} />
}
