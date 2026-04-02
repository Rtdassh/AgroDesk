"use client"

import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import {
  Truck,
  Package,
  DollarSign,
  FileText,
  Search,
  Plus,
  Eye,
  Pencil,
  FileDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const suppliers = [
  { id: "PR001", name: "AgroQuim S.A.", contact: "Roberto Gonzalez", phone: "5555-1100", email: "ventas@agroquim.gt", products: 45, pending: 12500.00, lastOrder: "2026-02-20", status: "Activo" },
  { id: "PR002", name: "Syngenta GT", contact: "Laura Martinez", phone: "5555-2200", email: "pedidos@syngenta.gt", products: 32, pending: 0, lastOrder: "2026-02-18", status: "Activo" },
  { id: "PR003", name: "BioAgro Ltd.", contact: "Pedro Ramirez", phone: "5555-3300", email: "info@bioagro.com", products: 18, pending: 5600.00, lastOrder: "2026-02-15", status: "Activo" },
  { id: "PR004", name: "AgroChem S.A.", contact: "Sofia Hernandez", phone: "5555-4400", email: "compras@agrochem.gt", products: 27, pending: 0, lastOrder: "2026-02-12", status: "Activo" },
  { id: "PR005", name: "Bayer GT", contact: "Miguel Torres", phone: "5555-5500", email: "ventas@bayer.gt", products: 56, pending: 28900.00, lastOrder: "2026-02-22", status: "Activo" },
  { id: "PR006", name: "FertiGuat", contact: "Rosa Mejia", phone: "5555-6600", email: "ventas@fertiguat.gt", products: 15, pending: 3200.00, lastOrder: "2026-01-30", status: "Inactivo" },
]

export default function ProveedoresPage() {
  const totalPending = suppliers.reduce((sum, s) => sum + s.pending, 0)

  return (
    <AppShell>
      <PageHeader icon={Truck} title="Gestion de Proveedores" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Proveedores" value={suppliers.length.toString()} icon={Truck} subtitle="Proveedores registrados" />
        <StatCard title="Productos Asociados" value="193" icon={Package} subtitle="De todos los proveedores" />
        <StatCard title="Cuentas por Pagar" value={`Q${totalPending.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} subtitle="Total pendiente de pago" />
        <StatCard title="Facturas Pendientes" value="12" icon={FileText} subtitle="Facturas sin procesar" />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Directorio de Proveedores</h2>
            <p className="text-sm text-muted-foreground">Registro, historial de compras y control de facturas</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Proveedor
            </Button>
          </div>
        </div>

        <div className="px-5 pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar proveedores..." className="pl-9" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Proveedor</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Contacto</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Telefono</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Productos</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Saldo Pend. (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Ult. Pedido</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="border-t border-border">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{supplier.id}</td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold text-foreground">{supplier.name}</p>
                    <p className="text-xs text-muted-foreground">{supplier.email}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{supplier.contact}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{supplier.phone}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{supplier.products}</td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">
                    Q{supplier.pending.toLocaleString("en", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{supplier.lastOrder}</td>
                  <td className="px-5 py-3">
                    <Badge variant={supplier.status === "Inactivo" ? "secondary" : "outline"}>
                      {supplier.status}
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
