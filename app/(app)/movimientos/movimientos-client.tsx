"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { DataTable, type Column } from "@/components/data-table"
import { TrendingUp, ArrowUpRight, ArrowDownRight, Package, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export function MovimientosClient({ initialMovements }: { initialMovements: any[] }) {
  const [search, setSearch] = useState("")
  const movements = initialMovements

  const todayStr = new Date().toISOString().split("T")[0]
  const entradasHoy = movements.filter((m: any) => m.type === "Entrada" && m.raw_date.startsWith(todayStr)).length
  const salidasHoy = movements.filter((m: any) => m.type === "Salida" && m.raw_date.startsWith(todayStr)).length
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const totalMovs7Days = movements.filter((m: any) => new Date(m.raw_date) >= sevenDaysAgo).length

  const filteredMovements = movements.filter((m: any) =>
    m.product.toLowerCase().includes(search.toLowerCase()) ||
    m.code.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  )

  const columns: Column<any>[] = [
    { key: "id", header: "ID", render: (r) => <span className="font-medium">{r.id}</span> },
    { key: "date", header: "Fecha/Hora", render: (r) => <span className="text-muted-foreground">{r.date}</span> },
    { key: "type", header: "Tipo", render: (r) => (
      <Badge variant={r.type === "Entrada" ? "outline" : r.type === "Salida" ? "secondary" : "destructive"}>
        {r.type === "Entrada" && <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />}
        {r.type === "Salida" && <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />}
        {r.type}
      </Badge>
    )},
    { key: "product", header: "Producto", render: (r) => r.product },
    { key: "code", header: "Codigo", render: (r) => <span className="text-muted-foreground">{r.code}</span> },
    { key: "qty", header: "Cantidad", render: (r) => (
      <span className={r.qty > 0 ? "font-medium text-green-600" : "font-medium text-red-600"}>
        {r.qty > 0 ? `+${r.qty}` : r.qty}
      </span>
    )},
    { key: "reason", header: "Motivo", render: (r) => <span className="text-muted-foreground">{r.reason}</span> },
  ]

  return (
    <>
      <PageHeader icon={TrendingUp} title="Movimientos de Inventario" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Entradas Hoy" value={entradasHoy.toString()} icon={ArrowUpRight} subtitle="Productos ingresados" />
        <StatCard title="Salidas Hoy" value={salidasHoy.toString()} icon={ArrowDownRight} subtitle="Productos despachados" />
        <StatCard title="Total Movimientos" value={totalMovs7Days.toString()} icon={Package} subtitle="Ultimos 7 dias" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Kardex Digital</CardTitle>
          <CardDescription>Registro de entradas, salidas y ajustes de inventario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar movimientos..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <DataTable columns={columns} data={filteredMovements} rowKey={(r) => r.id} emptyIcon={TrendingUp} emptyMessage="No se encontraron movimientos." />
        </CardContent>
      </Card>
    </>
  )
}
