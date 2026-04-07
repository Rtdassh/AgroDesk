import { getTransactions, getCashClosings } from "@/app/actions/finances"
import { FinanzasClient } from "./finanzas-client"

export const dynamic = 'force-dynamic'

export default async function FinanzasPage() {
  const [transactions, cashClosings] = await Promise.all([
    getTransactions(),
    getCashClosings()
  ])
  
  return <FinanzasClient initialTransactions={transactions} initialCashClosings={cashClosings} />
}
