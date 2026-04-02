"use client"

import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import {
  FileText,
  DollarSign,
  Receipt,
  AlertTriangle,
  Search,
  Plus,
  Eye,
  Printer,
  FileDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const invoices = [
  { id: "FAC-0001", date: "2026-02-23", client: "Juan Perez", nit: "1234567-8", subtotal: 1250.00, iva: 150.00, total: 1400.00, saleRef: "V-0001", status: "Emitida" },
  { id: "FAC-0002", date: "2026-02-23", client: "Maria Lopez", nit: "9876543-2", subtotal: 3690.50, iva: 442.86, total: 4133.36, saleRef: "V-0002", status: "Pendiente" },
  { id: "FAC-0003", date: "2026-02-22", client: "Agro Campo S.A.", nit: "5463728-1", subtotal: 14220.00, iva: 1706.40, total: 15926.40, saleRef: "V-0003", status: "Emitida" },
  { id: "FAC-0004", date: "2026-02-22", client: "Carlos Mendez", nit: "CF", subtotal: 520.00, iva: 62.40, total: 582.40, saleRef: "V-0004", status: "Emitida" },
  { id: "FAC-0005", date: "2026-02-21", client: "Finca El Roble", nit: "7412589-3", subtotal: 7290.00, iva: 874.80, total: 8164.80, saleRef: "V-0005", status: "Emitida" },
  { id: "FAC-0006", date: "2026-02-21", client: "Ana Rodriguez", nit: "3698521-4", subtotal: 125.00, iva: 15.00, total: 140.00, saleRef: "V-0006", status: "Anulada" },
]

export default function FacturasPage() {
  return (
    <AppShell>
      <PageHeader icon={FileText} title="Gestion de Facturas" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Facturas Emitidas" value={invoices.filter(i => i.status === "Emitida").length.toString()} icon={Receipt} subtitle="Este mes" />
        <StatCard title="Total Facturado" value="Q30,346.96" icon={DollarSign} subtitle="Incluyendo IVA" />
        <StatCard title="Facturas Pendientes" value={invoices.filter(i => i.status === "Pendiente").length.toString()} icon={FileText} subtitle="Sin procesar" />
        <StatCard title="Facturas Anuladas" value={invoices.filter(i => i.status === "Anulada").length.toString()} icon={AlertTriangle} subtitle="Este mes" />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Registro de Facturas</h2>
            <p className="text-sm text-muted-foreground">Generacion de factura y comprobante - Formato SAT</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar SAT
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Factura
            </Button>
          </div>
        </div>

        <div className="px-5 pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar facturas..." className="pl-9" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">No. Factura</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">NIT</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Subtotal (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">IVA (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Total (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Ref. Venta</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-border">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{inv.id}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{inv.date}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{inv.client}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{inv.nit}</td>
                  <td className="px-5 py-3 text-sm text-foreground">Q{inv.subtotal.toLocaleString("en", { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">Q{inv.iva.toLocaleString("en", { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">Q{inv.total.toLocaleString("en", { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{inv.saleRef}</td>
                  <td className="px-5 py-3">
                    <Badge variant={inv.status === "Anulada" ? "destructive" : inv.status === "Pendiente" ? "secondary" : "outline"}>
                      {inv.status}
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
