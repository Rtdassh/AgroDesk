"use client"

import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import {
  ShoppingCart,
  DollarSign,
  Receipt,
  Users,
  Search,
  Plus,
  Eye,
  Printer,
  FileDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const sales = [
  { id: "V-0001", date: "2026-02-23", client: "Juan Perez", nit: "1234567-8", items: 5, subtotal: 1250.00, discount: 0, total: 1250.00, payment: "Contado", status: "Completada" },
  { id: "V-0002", date: "2026-02-23", client: "Maria Lopez", nit: "9876543-2", items: 3, subtotal: 3890.50, discount: 200.00, total: 3690.50, payment: "Credito", status: "Pendiente" },
  { id: "V-0003", date: "2026-02-22", client: "Agro Campo S.A.", nit: "5463728-1", items: 12, subtotal: 15800.00, discount: 1580.00, total: 14220.00, payment: "Credito", status: "Completada" },
  { id: "V-0004", date: "2026-02-22", client: "Carlos Mendez", nit: "CF", items: 2, subtotal: 520.00, discount: 0, total: 520.00, payment: "Contado", status: "Completada" },
  { id: "V-0005", date: "2026-02-21", client: "Finca El Roble", nit: "7412589-3", items: 8, subtotal: 8100.00, discount: 810.00, total: 7290.00, payment: "Credito", status: "Completada" },
  { id: "V-0006", date: "2026-02-21", client: "Ana Rodriguez", nit: "3698521-4", items: 1, subtotal: 125.00, discount: 0, total: 125.00, payment: "Contado", status: "Anulada" },
]

export default function VentasPage() {
  return (
    <AppShell>
      <PageHeader icon={ShoppingCart} title="Gestion de Ventas" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ventas del Dia" value="Q13,680.50" icon={ShoppingCart} subtitle="8 ventas realizadas" />
        <StatCard title="Ingresos Mes" value="Q185,320.00" icon={DollarSign} subtitle="+8% vs. mes anterior" />
        <StatCard title="Facturas Emitidas" value="245" icon={Receipt} subtitle="En el mes actual" />
        <StatCard title="Clientes Atendidos" value="89" icon={Users} subtitle="Clientes unicos este mes" />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Registro de Ventas</h2>
            <p className="text-sm text-muted-foreground">Busqueda inteligente de productos, generacion de factura/comprobante</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Venta
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-5 pb-4 md:flex-row md:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por cliente, NIT, No. venta..." className="pl-9" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">No. Venta</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">NIT</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Items</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Descuento</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Total (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Pago</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-t border-border">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{sale.id}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{sale.date}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{sale.client}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{sale.nit}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{sale.items}</td>
                  <td className="px-5 py-3 text-sm text-foreground">Q{sale.discount.toFixed(2)}</td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">Q{sale.total.toLocaleString("en", { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3">
                    <Badge variant={sale.payment === "Credito" ? "secondary" : "outline"}>
                      {sale.payment}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={sale.status === "Anulada" ? "destructive" : sale.status === "Pendiente" ? "secondary" : "outline"}>
                      {sale.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
