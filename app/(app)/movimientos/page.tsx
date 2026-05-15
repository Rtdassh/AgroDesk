import { getMovements } from "@/app/actions/purchases"
import { MovimientosClient } from "./movimientos-client"



export default async function MovimientosPage() {
  const movements = await getMovements()
  
  return <MovimientosClient initialMovements={movements} />
}
