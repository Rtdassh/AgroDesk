"use client"

import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const lowStockProducts = [
  { id: "P001", name: "Laptop Dell Inspiron 15", category: "Electronicos", stock: 3, min: 10, supplier: "Tech Solutions", status: "Critico" },
  { id: "P002", name: "Mouse Inalambrico Logitech", category: "Accesorios", stock: 8, min: 15, supplier: "Office Supplies Co.", status: "Bajo" },
  { id: "P003", name: "Monitor Samsung 24\"", category: "Electronicos", stock: 2, min: 8, supplier: "Display World", status: "Critico" },
  { id: "P004", name: "Teclado Mecanico RGB", category: "Accesorios", stock: 12, min: 20, supplier: "Gaming Gear Ltd.", status: "Bajo" },
  { id: "P005", name: "Impresora HP LaserJet", category: "Oficina", stock: 1, min: 5, supplier: "Print Solutions", status: "Critico" },
]

const recentSales = [
  { id: "V001", client: "Juan Perez", total: "Q1,250.00", items: 3, date: "2026-02-23", status: "Completada" },
  { id: "V002", client: "Maria Lopez", total: "Q3,890.50", items: 7, date: "2026-02-23", status: "Completada" },
  { id: "V003", client: "Carlos Mendez", total: "Q520.00", items: 2, date: "2026-02-22", status: "Pendiente" },
  { id: "V004", client: "Ana Rodriguez", total: "Q8,100.00", items: 12, date: "2026-02-22", status: "Completada" },
]

export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeader icon={LayoutDashboard} title="Dashboard de Inventario" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Productos"
          value="1,234"
          icon={Package}
          subtitle="Productos registrados"
          change="+12% desde el mes pasado"
        />
        <StatCard
          title="Stock Bajo"
          value="23"
          icon={AlertTriangle}
          subtitle="Productos con stock critico"
          change="Requieren atencion inmediata"
        />
        <StatCard
          title="Valor Total"
          value="Q45,231"
          icon={DollarSign}
          subtitle="Valor total del inventario"
          change="+8% desde el mes pasado"
        />
        <StatCard
          title="Productos Activos"
          value="1,156"
          icon={TrendingUp}
          subtitle="Productos disponibles"
          change="94% del inventario total"
        />
      </div>

      {/* Ventas del dia */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Ventas Hoy</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">Q12,450.00</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
            <ArrowUpRight className="h-3 w-3" />
            <span>+15% vs. ayer</span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Ingresos del Mes</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">Q185,320.00</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
            <ArrowUpRight className="h-3 w-3" />
            <span>+8% vs. mes anterior</span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Cuentas por Cobrar</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">Q23,450.00</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <ArrowDownRight className="h-3 w-3" />
            <span>5 clientes con mora</span>
          </div>
        </div>
      </div>

      {/* Low stock table */}
      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Productos con Stock Bajo</h2>
            <p className="text-sm text-muted-foreground">Productos que requieren reabastecimiento inmediato</p>
          </div>
          <Button variant="default" size="sm">Ver Todos</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Producto</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Categoria</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Stock Actual</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Stock Minimo</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Proveedor</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((product) => (
                <tr key={product.id} className="border-t border-border">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{product.id}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{product.name}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{product.category}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{product.stock}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{product.min}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{product.supplier}</td>
                  <td className="px-5 py-3">
                    <Badge variant={product.status === "Critico" ? "destructive" : "outline"}>
                      {product.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent sales */}
      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Ventas Recientes</h2>
            <p className="text-sm text-muted-foreground">Ultimas transacciones realizadas</p>
          </div>
          <Button variant="default" size="sm">Ver Todas</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">No. Venta</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Total</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Items</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.id} className="border-t border-border">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{sale.id}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{sale.client}</td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{sale.total}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{sale.items}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{sale.date}</td>
                  <td className="px-5 py-3">
                    <Badge variant={sale.status === "Completada" ? "outline" : "secondary"}>
                      {sale.status}
                    </Badge>
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
