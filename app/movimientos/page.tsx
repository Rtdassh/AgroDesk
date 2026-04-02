"use client"

import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { TrendingUp, ArrowUpRight, ArrowDownRight, Package, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

const movements = [
  { id: "MOV001", date: "2026-02-23 14:30", type: "Entrada", product: "ENGEO 247 SC 250 ML", code: "A002", qty: 50, prev: 45, current: 95, reason: "Compra a proveedor", user: "Admin" },
  { id: "MOV002", date: "2026-02-23 11:15", type: "Salida", product: "BELAK 35 EC 100 CC", code: "A001", qty: 5, prev: 20, current: 15, reason: "Venta V-0001", user: "Admin" },
  { id: "MOV003", date: "2026-02-23 10:00", type: "Salida", product: "GRAMOXONE SL 1 LT", code: "A004", qty: 10, prev: 60, current: 50, reason: "Venta V-0002", user: "Admin" },
  { id: "MOV004", date: "2026-02-22 16:45", type: "Entrada", product: "CIPERMETRINA 25 EC 1 LT", code: "A006", qty: 30, prev: 0, current: 30, reason: "Compra a proveedor", user: "Admin" },
  { id: "MOV005", date: "2026-02-22 09:30", type: "Salida", product: "AMISTAR 50 WG 10 GR", code: "A003", qty: 7, prev: 10, current: 3, reason: "Venta V-0003", user: "Admin" },
  { id: "MOV006", date: "2026-02-21 15:20", type: "Ajuste", product: "ROUNDUP MAX 680 WG", code: "A007", qty: -2, prev: 10, current: 8, reason: "Ajuste por inventario", user: "Admin" },
  { id: "MOV007", date: "2026-02-21 12:00", type: "Entrada", product: "MANCOZEB 80 WP 1 KG", code: "A005", qty: 20, prev: 2, current: 22, reason: "Compra a proveedor", user: "Admin" },
]

export default function MovimientosPage() {
  return (
    <AppShell>
      <PageHeader icon={TrendingUp} title="Movimientos de Inventario" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Entradas Hoy" value="2" icon={ArrowUpRight} subtitle="Productos ingresados" />
        <StatCard title="Salidas Hoy" value="3" icon={ArrowDownRight} subtitle="Productos despachados" />
        <StatCard title="Total Movimientos" value={movements.length.toString()} icon={Package} subtitle="Ultimos 7 dias" />
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
            <Input placeholder="Buscar movimientos..." className="pl-9" />
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
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Ant.</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Actual</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((mov) => (
                <tr key={mov.id} className="border-t border-border">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{mov.id}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{mov.date}</td>
                  <td className="px-5 py-3">
                    <Badge variant={mov.type === "Entrada" ? "outline" : mov.type === "Salida" ? "secondary" : "destructive"}>
                      {mov.type === "Entrada" && <ArrowUpRight className="mr-1 h-3 w-3" />}
                      {mov.type === "Salida" && <ArrowDownRight className="mr-1 h-3 w-3" />}
                      {mov.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground">{mov.product}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{mov.code}</td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{mov.qty > 0 ? `+${mov.qty}` : mov.qty}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{mov.prev}</td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{mov.current}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{mov.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
