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
import { getDashboardData } from "@/app/actions/dashboard"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const data = await getDashboardData()

  if (!data) {
    return (
      <AppShell>
        <PageHeader icon={LayoutDashboard} title="Dashboard de Inventario" />
        <div className="flex h-64 items-center justify-center">
          <p className="text-red-500">Error al cargar los datos del dashboard.</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageHeader icon={LayoutDashboard} title="Dashboard de Inventario" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Productos"
          value={data.totalProducts.toString()}
          icon={Package}
          subtitle="Productos registrados"
        />
        <StatCard
          title="Stock Bajo"
          value={data.lowStockProductsCount.toString()}
          icon={AlertTriangle}
          subtitle="Productos con stock critico"
        />
        <StatCard
          title="Valor Total"
          value={`Q${data.totalValue.toLocaleString("en", { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          subtitle="Valor total del inventario"
        />
        <StatCard
          title="Productos Activos"
          value={data.activeProducts.toString()}
          icon={TrendingUp}
          subtitle={`${data.totalProducts > 0 ? Math.round((data.activeProducts / data.totalProducts) * 100) : 0}% del inventario`}
        />
      </div>

      {/* Ventas del dia */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Ventas Hoy</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            Q{data.salesToday.toLocaleString("en", { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <span>En el dia actual</span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Ingresos del Mes</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            Q{data.incomeMonth.toLocaleString("en", { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <span>En el mes actual</span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Cuentas por Cobrar</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            Q{data.accountsReceivable.toLocaleString("en", { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
            <ArrowDownRight className="h-3 w-3" />
            <span>{data.clientsWithDebt} clientes con mora</span>
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
          <Link href="/inventario">
            <Button variant="default" size="sm">Ver Todos</Button>
          </Link>
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
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStockList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-sm text-muted-foreground">
                    No hay productos con stock bajo.
                  </td>
                </tr>
              ) : (
                data.lowStockList.map((product: any) => (
                  <tr key={product.id} className="border-t border-border">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{product.id}</td>
                    <td className="px-5 py-3 text-sm text-foreground">{product.name}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{product.category}</td>
                    <td className="px-5 py-3 text-sm text-foreground">{product.stock}</td>
                    <td className="px-5 py-3 text-sm text-foreground">{product.min}</td>
                    <td className="px-5 py-3">
                      <Badge variant={product.status === "Critico" ? "destructive" : "outline"}>
                        {product.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
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
          <Link href="/ventas">
            <Button variant="default" size="sm">Ver Todas</Button>
          </Link>
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
              {data.recentSalesList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-sm text-muted-foreground">
                    No hay ventas registradas.
                  </td>
                </tr>
              ) : (
                data.recentSalesList.map((sale: any) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
