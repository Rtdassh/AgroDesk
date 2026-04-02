"use client"

import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import {
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  FileDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const topProducts = [
  { rank: 1, code: "A004", name: "GRAMOXONE SL 1 LT", category: "Herbicidas", sold: 320, revenue: 20800.00, margin: "18%" },
  { rank: 2, code: "A002", name: "ENGEO 247 SC 250 ML", category: "Insecticidas", sold: 280, revenue: 23940.00, margin: "22%" },
  { rank: 3, code: "B001", name: "UREA 46-0-0 50KG", category: "Fertilizantes", sold: 245, revenue: 36750.00, margin: "15%" },
  { rank: 4, code: "A006", name: "CIPERMETRINA 25 EC 1 LT", category: "Insecticidas", sold: 198, revenue: 10890.00, margin: "20%" },
  { rank: 5, code: "A001", name: "BELAK 35 EC 100 CC", category: "Insecticidas", sold: 175, revenue: 2241.75, margin: "16%" },
]

const lowRotation = [
  { code: "C008", name: "SEMILLA MAIZ HB-83", category: "Semillas", sold: 5, days: 45, lastSale: "2026-01-10" },
  { code: "D003", name: "BOMBA ASPERSORA 20L", category: "Herramientas", sold: 2, days: 60, lastSale: "2025-12-25" },
  { code: "E001", name: "MANGUERA RIEGO 50M", category: "Equipos de Riego", sold: 1, days: 90, lastSale: "2025-11-26" },
]

export default function ReportesPage() {
  return (
    <AppShell>
      <PageHeader icon={BarChart3} title="Reportes y Analisis BI" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ventas del Mes" value="Q185,320.00" icon={ShoppingCart} subtitle="Febrero 2026" change="+8% vs. enero" />
        <StatCard title="Productos Vendidos" value="1,845" icon={Package} subtitle="Unidades este mes" />
        <StatCard title="Ganancia Bruta" value="Q42,520.00" icon={DollarSign} subtitle="Margen promedio 19%" />
        <StatCard title="Tendencia" value="+12%" icon={TrendingUp} subtitle="Crecimiento trimestral" />
      </div>

      {/* Top Products */}
      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Productos Mas Vendidos</h2>
            <p className="text-sm text-muted-foreground">Ventas diarias, mensuales y anuales</p>
          </div>
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar Reporte
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">#</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Codigo</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Producto</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Categoria</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Uds. Vendidas</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Ingreso (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Margen</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.rank} className="border-t border-border">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{p.rank}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{p.code}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-foreground">{p.name}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{p.category}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{p.sold}</td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">Q{p.revenue.toLocaleString("en", { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3"><Badge variant="outline">{p.margin}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Rotation */}
      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Productos de Baja Rotacion</h2>
            <p className="text-sm text-muted-foreground">Productos con pocas ventas en los ultimos 90 dias</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Codigo</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Producto</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Categoria</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Uds. Vendidas</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Dias sin Venta</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Ultima Venta</th>
              </tr>
            </thead>
            <tbody>
              {lowRotation.map((p) => (
                <tr key={p.code} className="border-t border-border">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{p.code}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{p.name}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{p.category}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{p.sold}</td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{p.days}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{p.lastSale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventario Valorizado */}
      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <h2 className="text-lg font-bold text-foreground">Reporte de Inventario Actual Valorizado</h2>
        <p className="mb-4 text-sm text-muted-foreground">Resumen del valor total del inventario por categoria</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { cat: "Insecticidas", value: "Q12,450.00", items: 45 },
            { cat: "Herbicidas", value: "Q8,920.00", items: 32 },
            { cat: "Fungicidas", value: "Q6,780.00", items: 28 },
            { cat: "Fertilizantes", value: "Q15,200.00", items: 56 },
          ].map((item) => (
            <div key={item.cat} className="rounded-lg border border-border p-4">
              <p className="text-sm font-medium text-muted-foreground">{item.cat}</p>
              <p className="mt-1 text-xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.items} productos</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
