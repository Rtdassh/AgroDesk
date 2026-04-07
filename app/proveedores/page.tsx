import { getSuppliers } from "@/app/actions/suppliers"
import { ProveedoresClient } from "./proveedores-client"

export const dynamic = 'force-dynamic'

export default async function ProveedoresPage() {
  const suppliers = await getSuppliers()
  
  return <ProveedoresClient initialSuppliers={suppliers} />
}
