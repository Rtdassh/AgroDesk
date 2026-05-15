import { getSuppliers } from "@/app/actions/suppliers"
import { ProveedoresClient } from "./proveedores-client"



export default async function ProveedoresPage() {
  const suppliers = await getSuppliers()
  
  return <ProveedoresClient initialSuppliers={suppliers} />
}
