"use client"

import { useMemo } from "react"
import {
  BarChart3, DollarSign, TrendingUp, TrendingDown, Receipt, Percent, AlertTriangle, Download, Wallet,
} from "lucide-react"
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { exportCSV } from "@/lib/export-csv"
import type { ReportData } from "@/app/actions/reports"

const CHART_COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-1)",
]

const formatCurrency = (n: number) =>
  `Q${n.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function ReportesClient({ data }: { data: ReportData }) {
  const { kpis, ventasPorMes, ingresosVsEgresos, topProductos, ventasPorCategoria, topClientes, topProveedores, proximosAVencer } = data

  const handleExportAll = () => {
    const rows: (string | number)[][] = []
    rows.push(["Reporte AgroDesk", new Date().toISOString()])
    rows.push([])
    rows.push(["KPIs"])
    rows.push(["Ingresos del mes", kpis.ingresosMes])
    rows.push(["Egresos del mes", kpis.egresosMes])
    rows.push(["Ganancia neta", kpis.gananciaNeta])
    rows.push(["Ticket promedio", kpis.ticketPromedio])
    rows.push(["Utilidad acumulada", kpis.utilidadAcumulada])
    rows.push(["Margen promedio (%)", (kpis.margenPromedio * 100).toFixed(2)])
    rows.push([])
    rows.push(["Ventas por mes", "Mes", "Total"])
    ventasPorMes.forEach((v) => rows.push(["", v.mes, v.total]))
    rows.push([])
    rows.push(["Top productos", "Producto", "Cantidad", "Total"])
    topProductos.forEach((t) => rows.push(["", t.producto, t.cantidad, t.total]))
    rows.push([])
    rows.push(["Top clientes", "Cliente", "Compras", "Total"])
    topClientes.forEach((t) => rows.push(["", t.cliente, t.compras, t.total]))
    rows.push([])
    rows.push(["Top proveedores", "Proveedor", "Ordenes", "Total"])
    topProveedores.forEach((t) => rows.push(["", t.proveedor, t.ordenes, t.total]))
    rows.push([])
    rows.push(["Proximos a vencer", "Producto", "Lote", "Fecha", "Stock", "Dias"])
    proximosAVencer.forEach((p) => rows.push(["", p.producto, p.lote, p.fecha_vencimiento, p.stock, p.dias]))
    exportCSV(`reporte-agrodesk-${Date.now()}`, rows[0]?.map((_, i) => `col${i}`) ?? [], rows)
  }

  const margenLabel = useMemo(() => `${(kpis.margenPromedio * 100).toFixed(1)}%`, [kpis.margenPromedio])

  const tooltipStyle = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader icon={BarChart3} title="Reportes y Analisis BI" />
        <Button onClick={handleExportAll} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Ingresos Mes" value={formatCurrency(kpis.ingresosMes)} icon={TrendingUp} />
        <StatCard title="Egresos Mes" value={formatCurrency(kpis.egresosMes)} icon={TrendingDown} />
        <StatCard title="Ganancia Neta" value={formatCurrency(kpis.gananciaNeta)} icon={DollarSign} />
        <StatCard title="Ticket Promedio" value={formatCurrency(kpis.ticketPromedio)} icon={Receipt} />
        <StatCard title="Utilidad Acumulada" value={formatCurrency(kpis.utilidadAcumulada)} icon={Wallet} />
        <StatCard title="Margen Promedio" value={margenLabel} icon={Percent} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Ventas por mes</CardTitle><CardDescription>Ultimos 12 meses</CardDescription></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ventasPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `Q${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => formatCurrency(Number(v))} contentStyle={tooltipStyle} />
                  <Bar dataKey="total" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Ventas por categoria</CardTitle><CardDescription>Distribucion del periodo</CardDescription></CardHeader>
          <CardContent>
            <div className="h-72">
              {ventasPorCategoria.length === 0 ? (
                <Empty className="h-full"><EmptyMedia variant="icon"><BarChart3 /></EmptyMedia><EmptyTitle>Sin datos</EmptyTitle></Empty>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ventasPorCategoria} dataKey="total" nameKey="categoria" outerRadius={90} label={(d: any) => d.categoria}>
                      {ventasPorCategoria.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatCurrency(Number(v))} contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Ingresos vs Egresos</CardTitle><CardDescription>Comparativo mensual</CardDescription></CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ingresosVsEgresos}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `Q${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="ingresos" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="egresos" stroke="var(--destructive)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top 10 productos</CardTitle><CardDescription>Mas vendidos por cantidad</CardDescription></CardHeader>
          <CardContent>
            <div className="h-80">
              {topProductos.length === 0 ? (
                <Empty className="h-full"><EmptyMedia variant="icon"><BarChart3 /></EmptyMedia><EmptyTitle>Sin datos</EmptyTitle></Empty>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductos} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis type="category" dataKey="producto" stroke="var(--muted-foreground)" fontSize={11} width={120} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="cantidad" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top clientes</CardTitle><CardDescription>Por monto comprado</CardDescription></CardHeader>
          <CardContent>
            {topClientes.length === 0 ? (
              <Empty className="py-8"><EmptyMedia variant="icon"><BarChart3 /></EmptyMedia><EmptyTitle>Sin datos</EmptyTitle></Empty>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Compras</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {topClientes.map((c) => (
                    <TableRow key={c.cliente}><TableCell className="font-medium">{c.cliente}</TableCell><TableCell className="text-muted-foreground">{c.compras}</TableCell><TableCell className="text-right font-medium">{formatCurrency(c.total)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top proveedores</CardTitle><CardDescription>Por monto comprado</CardDescription></CardHeader>
          <CardContent>
            {topProveedores.length === 0 ? (
              <Empty className="py-8"><EmptyMedia variant="icon"><BarChart3 /></EmptyMedia><EmptyTitle>Sin datos</EmptyTitle></Empty>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Proveedor</TableHead><TableHead>Ordenes</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {topProveedores.map((p) => (
                    <TableRow key={p.proveedor}><TableCell className="font-medium">{p.proveedor}</TableCell><TableCell className="text-muted-foreground">{p.ordenes}</TableCell><TableCell className="text-right font-medium">{formatCurrency(p.total)}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" /><CardTitle>Proximos a vencer</CardTitle></div>
            <CardDescription>Lotes con vencimiento en 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            {proximosAVencer.length === 0 ? (
              <Empty className="py-8"><EmptyMedia variant="icon"><AlertTriangle /></EmptyMedia><EmptyTitle>Sin lotes proximos a vencer</EmptyTitle></Empty>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>Lote</TableHead><TableHead>Vence</TableHead><TableHead>Stock</TableHead><TableHead className="text-right">Dias</TableHead></TableRow></TableHeader>
                <TableBody>
                  {proximosAVencer.map((l) => (
                    <TableRow key={`${l.lote}-${l.producto}`}>
                      <TableCell className="font-medium">{l.producto}</TableCell>
                      <TableCell className="text-muted-foreground">{l.lote}</TableCell>
                      <TableCell className="text-muted-foreground">{l.fecha_vencimiento}</TableCell>
                      <TableCell>{l.stock}</TableCell>
                      <TableCell className="text-right"><Badge variant={l.dias <= 7 ? "destructive" : l.dias <= 15 ? "secondary" : "outline"}>{l.dias < 0 ? "Vencido" : `${l.dias}d`}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
