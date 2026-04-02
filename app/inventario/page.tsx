"use client"

import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Package, DollarSign, AlertTriangle, Search, Plus, FileDown, FileSpreadsheet, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const products = [
  { no: 1, code: "A001", name: "BELAK", desc: "BELAK 35 EC 100 CC 1 M07", supplier: "--", invoice: "F20685", qty: 20, price: 12.81, total: 256.20, status: "Normal" },
  { no: 2, code: "A002", name: "ENGEO", desc: "ENGEO 247 SC 250 ML", supplier: "AgroQuim S.A.", invoice: "F20690", qty: 45, price: 85.50, total: 3847.50, status: "Normal" },
  { no: 3, code: "A003", name: "AMISTAR", desc: "AMISTAR 50 WG 10 GR", supplier: "Syngenta GT", invoice: "F20701", qty: 3, price: 42.00, total: 126.00, status: "Bajo" },
  { no: 4, code: "A004", name: "GRAMOXONE", desc: "GRAMOXONE SL 1 LT", supplier: "AgroQuim S.A.", invoice: "F20715", qty: 60, price: 65.00, total: 3900.00, status: "Normal" },
  { no: 5, code: "A005", name: "MANCOZEB", desc: "MANCOZEB 80 WP 1 KG", supplier: "BioAgro Ltd.", invoice: "F20720", qty: 2, price: 38.50, total: 77.00, status: "Critico" },
  { no: 6, code: "A006", name: "CIPERMETRINA", desc: "CIPERMETRINA 25 EC 1 LT", supplier: "AgroChem S.A.", invoice: "F20735", qty: 30, price: 55.00, total: 1650.00, status: "Normal" },
  { no: 7, code: "A007", name: "ROUNDUP", desc: "ROUNDUP MAX 680 WG 200G", supplier: "Bayer GT", invoice: "F20740", qty: 8, price: 125.00, total: 1000.00, status: "Bajo" },
]

export default function InventarioPage() {
  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + p.total, 0)
  const lowStock = products.filter((p) => p.status === "Critico" || p.status === "Bajo").length

  return (
    <AppShell>
      <PageHeader icon={Package} title="Gestion de Inventario" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Productos" value={totalProducts.toString()} icon={Package} />
        <StatCard title="Valor Total" value={`Q${totalValue.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} />
        <StatCard title="Stock Bajo" value={lowStock.toString()} icon={AlertTriangle} />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Productos en Inventario</h2>
            <p className="text-sm text-muted-foreground">Gestiona tu inventario de productos</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar Formato SAT
            </Button>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Producto
            </Button>
          </div>
        </div>

        <div className="px-5 pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar productos..." className="pl-9" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">No.</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Codigo</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Producto</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Proveedor</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">No. Factura</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Cantidad</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Precio (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Total (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.no} className="border-t border-border">
                  <td className="px-5 py-3 text-sm text-foreground">{product.no}</td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{product.code}</td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.desc}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{product.supplier}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{product.invoice}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{product.qty}</td>
                  <td className="px-5 py-3 text-sm text-foreground">Q{product.price.toFixed(2)}</td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">Q{product.total.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={product.status === "Critico" ? "destructive" : product.status === "Bajo" ? "secondary" : "outline"}>
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                        <Trash2 className="h-4 w-4" />
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
