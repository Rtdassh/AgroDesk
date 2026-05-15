import { getClients } from "@/app/actions/clients"
import { ClientesClient } from "./clientes-client"



export default async function ClientesPage() {
  const clients = await getClients()
  
  return <ClientesClient initialClients={clients} />
}
