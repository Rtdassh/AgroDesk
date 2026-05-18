"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { DataTable, type Column } from "@/components/data-table"
import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Search, FileDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { openCashSession, closeDailyCashV2 } from "@/app/actions/finances"
import { exportCSV } from "@/lib/export-csv"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function FinanzasClient({ initialTransactions, initialCashClosings }: { initialTransactions: any[]; initialCashClosings: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [openDialogOpen, setOpenDialogOpen] = useState(false)
  const [montoInicial, setMontoInicial] = useState<number | "">("")
  const [montoReal, setMontoReal] = useState<number | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const transactions = initialTransactions
  const cashClosings = initialCashClosings

  const openSession = cashClosings.find((c: any) => c.status === "Abierta")
  const isCajaAbierta = !!openSession

  let sessionTransactions: any[] = [];
  if (isCajaAbierta) {
    const startTime = new Date(openSession.raw_apertura).getTime();
    sessionTransactions = transactions.filter((t: any) => new Date(t.raw_date).getTime() >= startTime);
  }

  const ingresosSesion = sessionTransactions
    .filter((t: any) => t.type === "Ingreso" && t.status === "Completada")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const egresosSesion = sessionTransactions
    .filter((t: any) => t.type === "Egreso" && t.method === "Efectivo")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const gananciaNeta = ingresosSesion - egresosSesion;
  const currentCash = isCajaAbierta ? Number(openSession.opening) + ingresosSesion - egresosSesion : 0;

  const handleOpenCash = async () => {
    if (!montoInicial && montoInicial !== 0) { toast.error("Ingrese el monto inicial"); return }
    setIsSubmitting(true)
    try {
      const result = await openCashSession(Number(montoInicial))
      if (result.success) { toast.success("Caja aperturada exitosamente"); router.refresh(); setOpenDialogOpen(false); }
      else toast.error(result.error || "Error al aperturar caja")
    } catch { toast.error("Error inesperado") }
    finally { setIsSubmitting(false) }
  }

  const handleCloseCash = async () => {
    if (!isCajaAbierta) { toast.warning("No hay caja abierta."); return }
    if (!montoReal && montoReal !== 0) { toast.error("Ingrese el monto físico real"); return }
    setIsSubmitting(true)
    try {
      const result = await closeDailyCashV2(Number(montoReal))
      if (result.success) { toast.success("Cierre de caja registrado exitosamente"); router.refresh(); setCloseDialogOpen(false); }
      else toast.error(result.error || "Error al cerrar caja")
    } catch { toast.error("Error inesperado") }
    finally { setIsSubmitting(false) }
  }

  const filteredTransactions = sessionTransactions.filter((t: any) =>
    t.concept.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    (t.ref && t.ref.toLowerCase().includes(search.toLowerCase()))
  )

  const handleExport = () => {
    exportCSV("finanzas", ["ID", "Fecha", "Tipo", "Concepto", "Monto", "Metodo", "Referencia"],
      filteredTransactions.map((t: any) => [t.id, t.date, t.type, t.concept, t.amount, t.method, t.ref]))
  }

  const cashColumns: Column<any>[] = [
    { key: "date", header: "Fecha Apertura", render: (r) => <span className="font-medium text-xs">{r.fecha_apertura}</span> },
    { key: "opening", header: "Fondo Inicial (Q)", render: (r) => `Q${r.opening.toLocaleString("en", { minimumFractionDigits: 2 })}` },
    {
      key: "sales", header: "Ingresos (Q)", render: (r) => {
        const val = r.status === "Abierta" ? ingresosSesion : r.sales;
        return <span className="flex items-center gap-1"><ArrowUpRight className="h-3 w-3 text-green-600" />Q{val?.toLocaleString("en", { minimumFractionDigits: 2 }) || "0.00"}</span>
      }
    },
    {
      key: "expenses", header: "Egresos (Q)", render: (r) => {
        const val = r.status === "Abierta" ? egresosSesion : r.expenses;
        return <span className="flex items-center gap-1"><ArrowDownRight className="h-3 w-3 text-red-500" />Q{val?.toLocaleString("en", { minimumFractionDigits: 2 }) || "0.00"}</span>
      }
    },
    { 
      key: "expected", header: "Esperado (Q)", render: (r) => {
        const val = r.status === "Abierta" ? (Number(r.opening) + ingresosSesion - egresosSesion) : r.expected;
        return <span className="font-medium">Q{val?.toLocaleString("en", { minimumFractionDigits: 2 }) || "0.00"}</span>
      }
    },
    { key: "real", header: "Físico (Q)", render: (r) => <span className="font-medium">Q{(r.real || 0).toLocaleString("en", { minimumFractionDigits: 2 })}</span> },
    {
      key: "difference", header: "Cuadre", render: (r) => (
        <span className={`font-bold ${r.difference === 0 ? 'text-emerald-600' : r.difference > 0 ? 'text-amber-500' : 'text-destructive'}`}>
          {r.difference > 0 ? '+' : ''}{r.difference.toLocaleString("en", { minimumFractionDigits: 2 })}
        </span>
      )
    },
    { key: "status", header: "Estado", render: (r) => <Badge variant={r.status === "Abierta" ? "secondary" : "outline"}>{r.status}</Badge> },
  ]

  const txColumns: Column<any>[] = [
    { key: "id", header: "ID", render: (r) => <span className="font-medium">{r.id}</span> },
    { key: "date", header: "Fecha", render: (r) => <span className="text-muted-foreground">{r.date}</span> },
    {
      key: "type", header: "Tipo", render: (r) => (
        <Badge variant={r.type === "Ingreso" ? "outline" : "secondary"}>
          <span className="flex items-center gap-1">
            {r.type === "Ingreso" ? <ArrowUpRight className="h-3 w-3 text-green-600" /> : <ArrowDownRight className="h-3 w-3 text-red-500" />}
            {r.type}
          </span>
        </Badge>
      )
    },
    { key: "concept", header: "Concepto", render: (r) => r.concept },
    { key: "amount", header: "Monto (Q)", render: (r) => <span className="font-medium">Q{r.amount.toLocaleString("en", { minimumFractionDigits: 2 })}</span> },
    { key: "method", header: "Metodo", render: (r) => <span className="text-muted-foreground">{r.method}</span> },
    { key: "ref", header: "Referencia", render: (r) => <span className="text-muted-foreground">{r.ref}</span> },
  ]

  return (
    <>
      <PageHeader icon={DollarSign} title="Control Financiero" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ingresos de la Sesión" value={`Q${ingresosSesion.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={TrendingUp} subtitle="Ventas completadas del turno" />
        <StatCard title="Egresos de la Sesión" value={`Q${egresosSesion.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={TrendingDown} subtitle="Pagos en efectivo del turno" />
        <StatCard title="Ganancia Neta" value={`Q${gananciaNeta.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} subtitle="Ingresos - Egresos" />
        <StatCard title="Caja Físico Esperado" value={`Q${currentCash.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={Wallet} subtitle={isCajaAbierta ? "Caja Abierta" : "Caja Cerrada"} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Cierres de Caja</CardTitle>
          <CardDescription>Registro diario de apertura y cierre de caja</CardDescription>
          <CardAction>
            {!isCajaAbierta ? (
              <Button size="sm" onClick={() => setOpenDialogOpen(true)}>Aperturar Caja</Button>
            ) : (
              <Button size="sm" variant="destructive" onClick={() => { setMontoReal(""); setCloseDialogOpen(true); }}>Cerrar Caja</Button>
            )}
          </CardAction>
        </CardHeader>
        <CardContent>
          <DataTable columns={cashColumns} data={cashClosings} rowKey={(r) => r.id} emptyIcon={Wallet} emptyMessage="No hay cierres registrados." pageSize={10} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Movimientos Financieros</CardTitle>
          <CardDescription>Registro de ingresos y egresos operativos</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={handleExport}><FileDown className="mr-2 h-4 w-4" />Exportar</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar concepto o ID..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <DataTable columns={txColumns} data={filteredTransactions} rowKey={(r) => r.id} emptyIcon={DollarSign} emptyMessage="No se encontraron transacciones." />
        </CardContent>
      </Card>

      <AlertDialog open={openDialogOpen} onOpenChange={setOpenDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apertura de Caja</AlertDialogTitle>
            <AlertDialogDescription>
              Ingrese el monto en efectivo (Fondo de caja) con el que inicia su turno.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label>Monto Inicial (Q)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              className="mt-2 text-lg font-bold"
              value={montoInicial}
              onChange={(e) => setMontoInicial(e.target.value ? parseFloat(e.target.value) : "")}
              placeholder="Ej. 100.00"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <Button onClick={handleOpenCash} disabled={isSubmitting || montoInicial === ""}>
              {isSubmitting ? "Procesando..." : "Aperturar Caja"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cierre de Caja</AlertDialogTitle>
            <AlertDialogDescription>
              Cuente el dinero físico en la caja registradora e ingrese el total a continuación. El sistema calculará automáticamente si hay un faltante o sobrante de efectivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label className="font-bold text-primary">Monto Físico Real (Q)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              className="mt-2 text-lg font-bold border-primary"
              value={montoReal}
              onChange={(e) => setMontoReal(e.target.value ? parseFloat(e.target.value) : "")}
              placeholder="Ej. 1500.00"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <Button variant="destructive" onClick={handleCloseCash} disabled={isSubmitting || montoReal === ""}>
              {isSubmitting ? "Procesando..." : "Confirmar Cierre"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
