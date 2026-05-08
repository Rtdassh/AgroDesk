import { getClients } from "@/app/actions/clients"
import { ClientesClient } from "./clientes-client"

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const clients = await getClients()
  
  return <ClientesClient initialClients={clients} />
}
