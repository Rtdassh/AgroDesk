"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { DataTable, type Column } from "@/components/data-table"
import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Search, FileDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { closeDailyCash } from "@/app/actions/finances"
import { exportCSV } from "@/lib/export-csv"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function FinanzasClient({ initialTransactions, initialCashClosings }: { initialTransactions: any[]; initialCashClosings: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)

  const transactions = initialTransactions
  const cashClosings = initialCashClosings

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const currentMonthTxs = transactions.filter((t: any) => { const d = new Date(t.raw_date); return d.getMonth() === currentMonth && d.getFullYear() === currentYear })
  const ingresosMes = currentMonthTxs.filter((t: any) => t.type === "Ingreso").reduce((sum: number, t: any) => sum + t.amount, 0)
  const egresosMes = currentMonthTxs.filter((t: any) => t.type === "Egreso").reduce((sum: number, t: any) => sum + t.amount, 0)
  const gananciaNeta = ingresosMes - egresosMes

  const lastClosing = cashClosings.length > 0 ? cashClosings[0] : null
  const baseCash = lastClosing ? lastClosing.closing : 0
  const todayStr = new Date().toISOString().split("T")[0]
  const isClosedToday = lastClosing?.date === todayStr
  let currentCash = baseCash
  if (!isClosedToday) {
    const todayTxs = transactions.filter((t: any) => t.date === todayStr)
    const todayIn = todayTxs.filter((t: any) => t.type === "Ingreso").reduce((sum: number, t: any) => sum + t.amount, 0)
    const todayOut = todayTxs.filter((t: any) => t.type === "Egreso").reduce((sum: number, t: any) => sum + t.amount, 0)
    currentCash += todayIn - todayOut
  }

  const handleCloseCash = async () => {
    if (isClosedToday) { toast.warning("Ya se ha realizado un cierre hoy."); return }
    try {
      const result = await closeDailyCash()
      if (result.success) { toast.success("Cierre de caja registrado"); router.refresh() }
      else toast.error(result.error || "Error al cerrar caja")
    } catch { toast.error("Error inesperado") }
    finally { setCloseDialogOpen(false) }
  }

  const filteredTransactions = transactions.filter((t: any) =>
    t.concept.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.ref.toLowerCase().includes(search.toLowerCase())
  )

  const handleExport = () => {
    exportCSV("finanzas", ["ID", "Fecha", "Tipo", "Concepto", "Monto", "Metodo", "Referencia"],
      filteredTransactions.map((t: any) => [t.id, t.date, t.type, t.concept, t.amount, t.method, t.ref]))
  }

  const cashColumns: Column<any>[] = [
    { key: "date", header: "Fecha", render: (r) => <span className="font-medium">{r.date}</span> },
    { key: "opening", header: "Apertura (Q)", render: (r) => `Q${r.opening.toLocaleString("en", { minimumFractionDigits: 2 })}` },
    { key: "sales", header: "Ventas (Q)", render: (r) => (
      <span className="flex items-center gap-1"><ArrowUpRight className="h-3 w-3 text-green-600" />Q{r.sales.toLocaleString("en", { minimumFractionDigits: 2 })}</span>
    )},
    { key: "expenses", header: "Egresos (Q)", render: (r) => (
      <span className="flex items-center gap-1"><ArrowDownRight className="h-3 w-3 text-red-500" />Q{r.expenses.toLocaleString("en", { minimumFractionDigits: 2 })}</span>
    )},
    { key: "closing", header: "Cierre (Q)", render: (r) => <span className="font-medium">Q{r.closing.toLocaleString("en", { minimumFractionDigits: 2 })}</span> },
    { key: "status", header: "Estado", render: (r) => <Badge variant={r.status === "Abierto" ? "secondary" : "outline"}>{r.status}</Badge> },
  ]

  const txColumns: Column<any>[] = [
    { key: "id", header: "ID", render: (r) => <span className="font-medium">{r.id}</span> },
    { key: "date", header: "Fecha", render: (r) => <span className="text-muted-foreground">{r.date}</span> },
    { key: "type", header: "Tipo", render: (r) => (
      <Badge variant={r.type === "Ingreso" ? "outline" : "secondary"}>
        <span className="flex items-center gap-1">
          {r.type === "Ingreso" ? <ArrowUpRight className="h-3 w-3 text-green-600" /> : <ArrowDownRight className="h-3 w-3 text-red-500" />}
          {r.type}
        </span>
      </Badge>
    )},
    { key: "concept", header: "Concepto", render: (r) => r.concept },
    { key: "amount", header: "Monto (Q)", render: (r) => <span className="font-medium">Q{r.amount.toLocaleString("en", { minimumFractionDigits: 2 })}</span> },
    { key: "method", header: "Metodo", render: (r) => <span className="text-muted-foreground">{r.method}</span> },
    { key: "ref", header: "Referencia", render: (r) => <span className="text-muted-foreground">{r.ref}</span> },
  ]

  return (
    <>
      <PageHeader icon={DollarSign} title="Control Financiero" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ingresos del Mes" value={`Q${ingresosMes.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={TrendingUp} subtitle="Ventas y abonos" />
        <StatCard title="Egresos del Mes" value={`Q${egresosMes.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={TrendingDown} subtitle="Pagos y gastos" />
        <StatCard title="Ganancia Neta" value={`Q${gananciaNeta.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} subtitle="Ingresos - Egresos" />
        <StatCard title="Caja Actual" value={`Q${currentCash.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={Wallet} subtitle={isClosedToday ? "Caja cerrada por hoy" : "Caja en curso"} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Cierres de Caja</CardTitle>
          <CardDescription>Registro diario de apertura y cierre de caja</CardDescription>
          <CardAction>
            <Button size="sm" onClick={() => isClosedToday ? toast.warning("Caja ya cerrada hoy.") : setCloseDialogOpen(true)} disabled={isClosedToday}>
              {isClosedToday ? "Caja Cerrada" : "Cerrar Caja del Dia"}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <DataTable columns={cashColumns} data={cashClosings} rowKey={(r) => r.id} emptyIcon={Wallet} emptyMessage="No hay cierres registrados." pageSize={10} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Movimientos Financieros</CardTitle>
          <CardDescription>Registro de ingresos y egresos operativos</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={handleExport}><FileDown className="mr-2 h-4 w-4" />Exportar</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar concepto o ID..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <DataTable columns={txColumns} data={filteredTransactions} rowKey={(r) => r.id} emptyIcon={DollarSign} emptyMessage="No se encontraron transacciones." />
        </CardContent>
      </Card>

      <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cierre de caja</AlertDialogTitle>
            <AlertDialogDescription>Se registrara el cierre de caja del dia actual. Esta accion no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCloseCash}>Cerrar Caja</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
