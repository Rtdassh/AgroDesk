"use client"

import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { AlertCircle, Package, AlertTriangle, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const lowStockProducts = [
  { id: "P001", code: "A003", name: "AMISTAR 50 WG 10 GR", category: "Fungicidas", stock: 3, min: 10, supplier: "Syngenta GT", status: "Critico" },
  { id: "P002", code: "A005", name: "MANCOZEB 80 WP 1 KG", category: "Fungicidas", stock: 2, min: 8, supplier: "BioAgro Ltd.", status: "Critico" },
  { id: "P003", code: "A007", name: "ROUNDUP MAX 680 WG 200G", category: "Herbicidas", stock: 8, min: 15, supplier: "Bayer GT", status: "Bajo" },
  { id: "P004", code: "B012", name: "UREA 46-0-0 50KG", category: "Fertilizantes", stock: 5, min: 20, supplier: "FertiGuat", status: "Critico" },
  { id: "P005", code: "B015", name: "TRIPLE 15 50KG", category: "Fertilizantes", stock: 12, min: 25, supplier: "FertiGuat", status: "Bajo" },
  { id: "P006", code: "C008", name: "SEMILLA MAIZ HB-83", category: "Semillas", stock: 4, min: 15, supplier: "AgroQuim S.A.", status: "Critico" },
  { id: "P007", code: "A010", name: "KARATE ZEON 250 ML", category: "Insecticidas", stock: 6, min: 12, supplier: "Syngenta GT", status: "Bajo" },
]

export default function StockBajoPage() {
  const critical = lowStockProducts.filter(p => p.status === "Critico").length
  const low = lowStockProducts.filter(p => p.status === "Bajo").length

  return (
    <AppShell>
      <PageHeader icon={AlertCircle} title="Productos con Stock Bajo" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Alertas" value={lowStockProducts.length.toString()} icon={AlertCircle} subtitle="Productos bajo minimo" />
        <StatCard title="Stock Critico" value={critical.toString()} icon={AlertTriangle} subtitle="Requieren atencion urgente" />
        <StatCard title="Stock Bajo" value={low.toString()} icon={Package} subtitle="Proximos a agotarse" />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Alertas de Stock Minimo</h2>
            <p className="text-sm text-muted-foreground">Productos que requieren reabastecimiento inmediato</p>
          </div>
          <Button size="sm">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Generar Orden de Compra
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Codigo</th>
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
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{product.code}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{product.name}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{product.category}</td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{product.stock}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{product.min}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{product.supplier}</td>
                  <td className="px-5 py-3">
                    <Badge variant={product.status === "Critico" ? "destructive" : "secondary"}>
                      {product.status}
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
