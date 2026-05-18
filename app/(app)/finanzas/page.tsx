import { getTransactionsV2, getCashClosingsV2 } from "@/app/actions/finances"
import { FinanzasClient } from "./finanzas-client"

export const dynamic = "force-dynamic"

export default async function FinanzasPage() {
  const [transactions, cashClosings] = await Promise.all([
    getTransactionsV2(),
    getCashClosingsV2()
  ])
  
  return <FinanzasClient initialTransactions={transactions} initialCashClosings={cashClosings} />
}
