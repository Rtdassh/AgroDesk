import { getMovements } from "@/app/actions/purchases"
import { MovimientosClient } from "./movimientos-client"

export const dynamic = 'force-dynamic'

export default async function MovimientosPage() {
  const movements = await getMovements()
  
  return <MovimientosClient initialMovements={movements} />
}
