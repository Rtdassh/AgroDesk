"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Plus,
  FileDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { closeDailyCash } from "@/app/actions/finances"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function FinanzasClient({ initialTransactions, initialCashClosings }: { initialTransactions: any[], initialCashClosings: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")

  const transactions = initialTransactions
  const cashClosings = initialCashClosings

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const currentMonthTxs = transactions.filter(t => {
    const d = new Date(t.raw_date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const ingresosMes = currentMonthTxs.filter(t => t.type === "Ingreso").reduce((sum, t) => sum + t.amount, 0)
  const egresosMes = currentMonthTxs.filter(t => t.type === "Egreso").reduce((sum, t) => sum + t.amount, 0)
  const gananciaNeta = ingresosMes - egresosMes
  
  // Try to find the latest closing or calculate current cash based on transactions since last closing
  const lastClosing = cashClosings.length > 0 ? cashClosings[0] : null
  const baseCash = lastClosing ? lastClosing.closing : 0
  
  // Calculate unclosed cash by looking at transactions today if last closing wasn't today
  const todayStr = new Date().toISOString().split('T')[0]
  const isClosedToday = lastClosing?.date === todayStr
  
  let currentCash = baseCash
  if (!isClosedToday) {
    const todayTxs = transactions.filter(t => t.date === todayStr)
    const todayIn = todayTxs.filter(t => t.type === "Ingreso").reduce((sum, t) => sum + t.amount, 0)
    const todayOut = todayTxs.filter(t => t.type === "Egreso").reduce((sum, t) => sum + t.amount, 0)
    currentCash += (todayIn - todayOut)
  }

  const handleCloseCash = async () => {
    if (isClosedToday) {
      toast.warning("Ya se ha realizado un cierre de caja hoy.")
      return
    }
    
    if (!confirm("¿Está seguro de realizar el cierre de caja del día actual?")) return

    try {
      const result = await closeDailyCash()
      if (result.success) {
        toast.success("Cierre de caja registrado exitosamente")
        router.refresh()
      } else {
        toast.error(result.error || "Error al realizar el cierre")
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado")
    }
  }

  const filteredTransactions = transactions.filter(t => 
    t.concept.toLowerCase().includes(search.toLowerCase()) || 
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.ref.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell>
      <PageHeader icon={DollarSign} title="Control Financiero" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ingresos del Mes" value={`Q${ingresosMes.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={TrendingUp} subtitle="Ventas y abonos" />
        <StatCard title="Egresos del Mes" value={`Q${egresosMes.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={TrendingDown} subtitle="Pagos y gastos" />
        <StatCard title="Ganancia Neta" value={`Q${gananciaNeta.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} subtitle="Ingresos - Egresos" />
        <StatCard title="Caja Actual" value={`Q${currentCash.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={Wallet} subtitle={isClosedToday ? "Caja cerrada por hoy" : "Caja en curso"} />
      </div>

      {/* Cierre de Caja */}
      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Cierres de Caja</h2>
            <p className="text-sm text-muted-foreground">Registro diario de apertura y cierre de caja</p>
          </div>
          <Button size="sm" onClick={handleCloseCash} disabled={isClosedToday}>
            {isClosedToday ? "Caja Cerrada" : "Cerrar Caja del Dia"}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Apertura (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Ventas (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Egresos (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Cierre (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {cashClosings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-4 text-center text-sm text-muted-foreground">No hay cierres registrados.</td>
                </tr>
              ) : (
                cashClosings.map((day) => (
                  <tr key={day.id} className="border-t border-border">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{day.date}</td>
                    <td className="px-5 py-3 text-sm text-foreground">Q{day.opening.toLocaleString("en", { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-3 text-sm text-foreground">
                      <span className="flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3 text-green-600" />
                        Q{day.sales.toLocaleString("en", { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground">
                      <span className="flex items-center gap-1">
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                        Q{day.expenses.toLocaleString("en", { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      Q{day.closing.toLocaleString("en", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={day.status === "Abierto" ? "secondary" : "outline"}>
                        {day.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions */}
      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Movimientos Financieros</h2>
            <p className="text-sm text-muted-foreground">Registro de ingresos y egresos operativos</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Movimiento
            </Button>
          </div>
        </div>

        <div className="px-5 pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar concepto o ID..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Tipo</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Concepto</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Monto (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Metodo</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Referencia</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No se encontraron transacciones.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-border">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{tx.id}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{tx.date}</td>
                    <td className="px-5 py-3">
                      <Badge variant={tx.type === "Ingreso" ? "outline" : "secondary"}>
                        <span className="flex items-center gap-1">
                          {tx.type === "Ingreso" ? <ArrowUpRight className="h-3 w-3 text-green-600" /> : <ArrowDownRight className="h-3 w-3 text-red-500" />}
                          {tx.type}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground">{tx.concept}</td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      Q{tx.amount.toLocaleString("en", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{tx.method}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{tx.ref}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
