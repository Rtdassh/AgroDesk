"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { TrendingUp, ArrowUpRight, ArrowDownRight, Package, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export function MovimientosClient({ initialMovements }: { initialMovements: any[] }) {
  const [search, setSearch] = useState("")
  const movements = initialMovements

  const todayStr = new Date().toISOString().split('T')[0]
  const entradasHoy = movements.filter(m => m.type === "Entrada" && m.raw_date.startsWith(todayStr)).length
  const salidasHoy = movements.filter(m => m.type === "Salida" && m.raw_date.startsWith(todayStr)).length
  
  // Last 7 days total movements
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const totalMovs7Days = movements.filter(m => new Date(m.raw_date) >= sevenDaysAgo).length

  const filteredMovements = movements.filter(m => 
    m.product.toLowerCase().includes(search.toLowerCase()) || 
    m.code.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell>
      <PageHeader icon={TrendingUp} title="Movimientos de Inventario" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Entradas Hoy" value={entradasHoy.toString()} icon={ArrowUpRight} subtitle="Productos ingresados" />
        <StatCard title="Salidas Hoy" value={salidasHoy.toString()} icon={ArrowDownRight} subtitle="Productos despachados" />
        <StatCard title="Total Movimientos" value={totalMovs7Days.toString()} icon={Package} subtitle="Últimos 7 días" />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Kardex Digital</h2>
            <p className="text-sm text-muted-foreground">Registro de entradas, salidas y ajustes de inventario</p>
          </div>
        </div>

        <div className="px-5 pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar movimientos..." 
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
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Fecha/Hora</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Tipo</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Producto</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Codigo</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Cantidad</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No se encontraron movimientos.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => (
                  <tr key={mov.id} className="border-t border-border">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{mov.id}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{mov.date}</td>
                    <td className="px-5 py-3">
                      <Badge variant={mov.type === "Entrada" ? "outline" : mov.type === "Salida" ? "secondary" : "destructive"}>
                        {mov.type === "Entrada" && <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />}
                        {mov.type === "Salida" && <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />}
                        {mov.type}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground">{mov.product}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{mov.code}</td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      <span className={mov.qty > 0 ? "text-green-600" : "text-red-600"}>
                        {mov.qty > 0 ? `+${mov.qty}` : mov.qty}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{mov.reason}</td>
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
