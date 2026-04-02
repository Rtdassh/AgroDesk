"use client"

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

const transactions = [
  { id: "TF001", date: "2026-02-23", type: "Ingreso", concept: "Venta V-0001 - Juan Perez", amount: 1250.00, method: "Efectivo", ref: "V-0001" },
  { id: "TF002", date: "2026-02-23", type: "Ingreso", concept: "Venta V-0002 - Maria Lopez (Abono)", amount: 1500.00, method: "Transferencia", ref: "V-0002" },
  { id: "TF003", date: "2026-02-23", type: "Egreso", concept: "Pago Proveedor AgroQuim S.A.", amount: 8500.00, method: "Cheque", ref: "PG-0045" },
  { id: "TF004", date: "2026-02-22", type: "Ingreso", concept: "Venta V-0003 - Agro Campo S.A.", amount: 14220.00, method: "Transferencia", ref: "V-0003" },
  { id: "TF005", date: "2026-02-22", type: "Egreso", concept: "Pago servicios (Luz, Agua)", amount: 1200.00, method: "Efectivo", ref: "EG-0012" },
  { id: "TF006", date: "2026-02-22", type: "Egreso", concept: "Compra inventario - Bayer GT", amount: 15600.00, method: "Transferencia", ref: "PG-0046" },
  { id: "TF007", date: "2026-02-21", type: "Ingreso", concept: "Venta V-0005 - Finca El Roble", amount: 7290.00, method: "Efectivo", ref: "V-0005" },
  { id: "TF008", date: "2026-02-21", type: "Egreso", concept: "Pago nomina empleados", amount: 12000.00, method: "Transferencia", ref: "EG-0013" },
]

const cashClosings = [
  { date: "2026-02-23", opening: 5000.00, sales: 13680.50, expenses: 9700.00, closing: 8980.50, status: "Abierto" },
  { date: "2026-02-22", opening: 3500.00, sales: 14740.00, expenses: 16800.00, closing: 1440.00, status: "Cerrado" },
  { date: "2026-02-21", opening: 4200.00, sales: 7415.00, expenses: 12000.00, closing: -385.00, status: "Cerrado" },
]

export default function FinanzasPage() {
  return (
    <AppShell>
      <PageHeader icon={DollarSign} title="Control Financiero" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ingresos del Mes" value="Q185,320.00" icon={TrendingUp} subtitle="Ventas y abonos" change="+8% vs. mes anterior" />
        <StatCard title="Egresos del Mes" value="Q142,800.00" icon={TrendingDown} subtitle="Pagos y gastos" change="+3% vs. mes anterior" />
        <StatCard title="Ganancia Neta" value="Q42,520.00" icon={DollarSign} subtitle="Ingresos - Egresos" change="+22% vs. mes anterior" />
        <StatCard title="Caja Actual" value="Q8,980.50" icon={Wallet} subtitle="Saldo de caja hoy" />
      </div>

      {/* Cierre de Caja */}
      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Cierre de Caja Diario</h2>
            <p className="text-sm text-muted-foreground">Registro diario de apertura y cierre de caja</p>
          </div>
          <Button size="sm">Cerrar Caja del Dia</Button>
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
              {cashClosings.map((day) => (
                <tr key={day.date} className="border-t border-border">
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
              ))}
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
            <Input placeholder="Buscar movimientos..." className="pl-9" />
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
              {transactions.map((tx) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
