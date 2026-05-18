import { getSales, getClientesForSale, getProductosForSale } from "@/app/actions/sales"
import { getCashClosingsV2 } from "@/app/actions/finances"

export const dynamic = "force-dynamic"
import { VentasClient } from "./ventas-client"

export default async function VentasPage() {
  const [sales, clientes, productos, cashClosings] = await Promise.all([
    getSales(),
    getClientesForSale(),
    getProductosForSale(),
    getCashClosingsV2()
  ])
  
  const isCajaAbierta = cashClosings.some((c: any) => c.status === "Abierta")

  return <VentasClient initialSales={sales} initialClientes={clientes} initialProductos={productos} isCajaAbierta={isCajaAbierta} />
}
