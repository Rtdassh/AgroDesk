"use client"

import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import {
  UserCheck,
  Users,
  AlertTriangle,
  DollarSign,
  Search,
  Plus,
  Eye,
  Pencil,
  FileDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const clients = [
  { id: "C001", name: "Juan Perez", dpi: "1234 56789 0101", nit: "1234567-8", type: "Mayorista", phone: "5555-1234", balance: 0, purchases: 45, lastPurchase: "2026-02-23", status: "Activo" },
  { id: "C002", name: "Maria Lopez", dpi: "9876 54321 0102", nit: "9876543-2", type: "Minorista", phone: "5555-5678", balance: 3690.50, purchases: 12, lastPurchase: "2026-02-23", status: "Con Credito" },
  { id: "C003", name: "Agro Campo S.A.", dpi: "--", nit: "5463728-1", type: "Mayorista", phone: "5555-9012", balance: 14220.00, purchases: 128, lastPurchase: "2026-02-22", status: "Con Credito" },
  { id: "C004", name: "Carlos Mendez", dpi: "4567 89012 0301", nit: "CF", type: "Minorista", phone: "5555-3456", balance: 0, purchases: 3, lastPurchase: "2026-02-22", status: "Activo" },
  { id: "C005", name: "Finca El Roble", dpi: "--", nit: "7412589-3", type: "Mayorista", phone: "5555-7890", balance: 22490.00, purchases: 87, lastPurchase: "2026-02-21", status: "Mora" },
  { id: "C006", name: "Ana Rodriguez", dpi: "3698 52147 0501", nit: "3698521-4", type: "Minorista", phone: "5555-2345", balance: 0, purchases: 8, lastPurchase: "2026-02-21", status: "Activo" },
  { id: "C007", name: "Distribuidora GT", dpi: "--", nit: "8523697-5", type: "Mayorista", phone: "5555-6789", balance: 8500.00, purchases: 56, lastPurchase: "2026-02-20", status: "Con Credito" },
]

export default function ClientesPage() {
  const totalClients = clients.length
  const inMora = clients.filter((c) => c.status === "Mora").length
  const totalDebt = clients.reduce((sum, c) => sum + c.balance, 0)

  return (
    <AppShell>
      <PageHeader icon={UserCheck} title="Gestion de Clientes" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Clientes" value={totalClients.toString()} icon={Users} subtitle="Clientes registrados" />
        <StatCard title="Clientes Mayoristas" value={clients.filter(c => c.type === "Mayorista").length.toString()} icon={UserCheck} subtitle="Con precio especial" />
        <StatCard title="Cuentas por Cobrar" value={`Q${totalDebt.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} subtitle="Total saldos pendientes" />
        <StatCard title="Clientes en Mora" value={inMora.toString()} icon={AlertTriangle} subtitle="Requieren seguimiento" />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Directorio de Clientes</h2>
            <p className="text-sm text-muted-foreground">Registro, historial de compras y estado de cuenta</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </div>
        </div>

        <div className="px-5 pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nombre, DPI, NIT..." className="pl-9" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">NIT</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Tipo</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Telefono</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Compras</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Saldo (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Ult. Compra</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t border-border">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{client.id}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{client.name}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{client.nit}</td>
                  <td className="px-5 py-3">
                    <Badge variant={client.type === "Mayorista" ? "secondary" : "outline"}>
                      {client.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{client.phone}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{client.purchases}</td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">
                    Q{client.balance.toLocaleString("en", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{client.lastPurchase}</td>
                  <td className="px-5 py-3">
                    <Badge variant={client.status === "Mora" ? "destructive" : client.status === "Con Credito" ? "secondary" : "outline"}>
                      {client.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                        <Pencil className="h-4 w-4" />
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
