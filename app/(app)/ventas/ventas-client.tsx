"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { DataTable, type Column } from "@/components/data-table"
import { RowActions } from "@/components/row-actions"
import { ShoppingCart, DollarSign, Receipt, Users, Search, Plus, Eye, Printer, FileDown, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createSale } from "@/app/actions/sales"
import { exportCSV } from "@/lib/export-csv"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function VentasClient({ initialSales, initialClientes, initialProductos }: { initialSales: any[]; initialClientes: any[]; initialProductos: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const sales = initialSales
  const clientes = initialClientes
  const productos = initialProductos

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailSale, setDetailSale] = useState<any>(null)
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const today = new Date().toISOString().split("T")[0]
  const todaySales = sales.filter((s: any) => s.date === today)
  const totalToday = todaySales.reduce((sum: number, s: any) => sum + s.total, 0)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthSales = sales.filter((s: any) => { const d = new Date(s.date); return d.getMonth() === currentMonth && d.getFullYear() === currentYear })
  const totalMonth = monthSales.reduce((sum: number, s: any) => sum + s.total, 0)
  const uniqueClientsMonth = new Set(monthSales.map((s: any) => s.client)).size

  const filteredSales = sales.filter((s: any) =>
    s.client.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.nit.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenCreate = () => { setSelectedClient(""); setCart([]); setSelectedProduct(""); setSelectedQuantity(1); setIsModalOpen(true) }

  const addToCart = () => {
    if (!selectedProduct) { toast.error("Seleccione un producto"); return }
    const product = productos.find((p: any) => p.id_producto.toString() === selectedProduct)
    if (!product) return
    if (selectedQuantity <= 0) { toast.error("La cantidad debe ser mayor a 0"); return }
    if (selectedQuantity > product.stock_disponible) { toast.error("No hay suficiente stock"); return }
    const existing = cart.find((item) => item.product.id_producto === product.id_producto)
    if (existing) {
      const newQ = existing.quantity + selectedQuantity
      if (newQ > product.stock_disponible) { toast.error("La suma excede el stock disponible"); return }
      setCart(cart.map((item) => item.product.id_producto === product.id_producto ? { ...item, quantity: newQ } : item))
    } else {
      setCart([...cart, { product, quantity: selectedQuantity }])
    }
    setSelectedProduct(""); setSelectedQuantity(1)
  }

  const removeFromCart = (productId: number) => setCart(cart.filter((item) => item.product.id_producto !== productId))
  const cartTotal = cart.reduce((sum, item) => sum + item.product.precio_venta * item.quantity, 0)

  const handleSubmit = async () => {
    if (!selectedClient) { toast.error("Seleccione un cliente"); return }
    if (cart.length === 0) { toast.error("Agregue al menos un producto"); return }
    setIsSubmitting(true)
    try {
      const result = await createSale({
        id_cliente: parseInt(selectedClient), total: cartTotal,
        detalles: cart.map((item) => ({ id_producto: item.product.id_producto, cantidad: item.quantity, precio_unitario: item.product.precio_venta, subtotal: item.quantity * item.product.precio_venta })),
      })
      if (result.success) { toast.success("Venta registrada exitosamente"); setIsModalOpen(false); router.refresh() }
      else toast.error(result.error || "Error al registrar venta")
    } catch { toast.error("Error inesperado") }
    finally { setIsSubmitting(false) }
  }

  const handleExport = () => {
    exportCSV("ventas", ["No. Venta", "Fecha", "Cliente", "NIT", "Items", "Total", "Pago", "Estado"],
      filteredSales.map((s: any) => [s.id, s.date, s.client, s.nit, s.items, s.total, s.payment, s.status]))
  }

  const handlePrint = (sale: any) => {
    const w = window.open("", "_blank", "width=400,height=600")
    if (!w) return
    w.document.write(`<html><head><title>Venta ${sale.id}</title><style>body{font-family:sans-serif;padding:20px;font-size:13px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border-bottom:1px solid #ddd;padding:6px;text-align:left}th{font-size:11px;text-transform:uppercase;color:#666}.total{font-size:16px;font-weight:bold;text-align:right;margin-top:12px}</style></head><body>`)
    w.document.write(`<h2>AgroDesk - Comprobante</h2><p><strong>No. Venta:</strong> ${sale.id}<br/><strong>Fecha:</strong> ${sale.date}<br/><strong>Cliente:</strong> ${sale.client}<br/><strong>NIT:</strong> ${sale.nit}</p>`)
    w.document.write(`<p><strong>Items:</strong> ${sale.items} &middot; <strong>Pago:</strong> ${sale.payment}</p>`)
    w.document.write(`<p class="total">Total: Q${sale.total.toLocaleString("en", { minimumFractionDigits: 2 })}</p>`)
    w.document.write(`</body></html>`)
    w.document.close()
    w.print()
  }

  const columns: Column<any>[] = [
    { key: "id", header: "No. Venta", render: (r) => <span className="font-medium">{r.id}</span> },
    { key: "date", header: "Fecha", render: (r) => <span className="text-muted-foreground">{r.date}</span> },
    { key: "client", header: "Cliente", render: (r) => r.client },
    { key: "nit", header: "NIT", render: (r) => <span className="text-muted-foreground">{r.nit}</span> },
    { key: "items", header: "Items", render: (r) => r.items },
    { key: "total", header: "Total (Q)", render: (r) => <span className="font-medium">Q{r.total.toLocaleString("en", { minimumFractionDigits: 2 })}</span> },
    { key: "payment", header: "Pago", render: (r) => <Badge variant={r.payment === "Credito" ? "secondary" : "outline"}>{r.payment}</Badge> },
    { key: "status", header: "Estado", render: (r) => <Badge variant={r.status === "Anulada" ? "destructive" : r.status === "Pendiente" ? "secondary" : "outline"}>{r.status}</Badge> },
    { key: "actions", header: "", render: (r) => (
      <RowActions actions={[
        { label: "Ver detalle", icon: Eye, onClick: () => setDetailSale(r) },
        { label: "Imprimir", icon: Printer, onClick: () => handlePrint(r) },
      ]} />
    )},
  ]

  return (
    <>
      <PageHeader icon={ShoppingCart} title="Gestion de Ventas" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ventas del Dia" value={`Q${totalToday.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={ShoppingCart} subtitle={`${todaySales.length} ventas realizadas`} />
        <StatCard title="Ingresos Mes" value={`Q${totalMonth.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} subtitle="Mes actual" />
        <StatCard title="Facturas Emitidas" value={monthSales.length.toString()} icon={Receipt} subtitle="En el mes actual" />
        <StatCard title="Clientes Atendidos" value={uniqueClientsMonth.toString()} icon={Users} subtitle="Clientes unicos este mes" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Registro de Ventas</CardTitle>
          <CardDescription>Busqueda inteligente de ventas, generacion de factura/comprobante</CardDescription>
          <CardAction>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}><FileDown className="mr-2 h-4 w-4" />Exportar</Button>
              <Button size="sm" onClick={handleOpenCreate}><Plus className="mr-2 h-4 w-4" />Nueva Venta</Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por cliente, NIT, No. venta..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <DataTable columns={columns} data={filteredSales} rowKey={(r) => r.id} emptyIcon={ShoppingCart} emptyMessage="No se encontraron ventas." />
        </CardContent>
      </Card>

      {/* Detalle de venta */}
      <Dialog open={detailSale !== null} onOpenChange={(open) => { if (!open) setDetailSale(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalle de Venta {detailSale?.id}</DialogTitle></DialogHeader>
          {detailSale && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Fecha:</span> {detailSale.date}</div>
                <div><span className="text-muted-foreground">Cliente:</span> {detailSale.client}</div>
                <div><span className="text-muted-foreground">NIT:</span> {detailSale.nit}</div>
                <div><span className="text-muted-foreground">Pago:</span> {detailSale.payment}</div>
                <div><span className="text-muted-foreground">Items:</span> {detailSale.items}</div>
                <div><span className="text-muted-foreground">Estado:</span> {detailSale.status}</div>
              </div>
              <div className="border-t pt-3">
                <p className="text-right text-lg font-bold">Total: Q{detailSale.total.toLocaleString("en", { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Nueva venta */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Nueva Venta</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger><SelectValue placeholder="Seleccione un cliente..." /></SelectTrigger>
                <SelectContent>
                  {clientes.map((c: any) => (
                    <SelectItem key={c.id_cliente} value={c.id_cliente.toString()}>{c.nombre} (NIT: {c.nit || "C/F"})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-3 rounded-lg border bg-muted/20 p-4">
              <div className="flex-1 space-y-2">
                <Label>Producto</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger><SelectValue placeholder="Buscar producto..." /></SelectTrigger>
                  <SelectContent>
                    {productos.map((p: any) => (
                      <SelectItem key={p.id_producto} value={p.id_producto.toString()} disabled={p.stock_disponible <= 0}>
                        {p.codigo} - {p.nombre} (Stock: {p.stock_disponible}) - Q{p.precio_venta}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24 space-y-2">
                <Label>Cantidad</Label>
                <Input type="number" min="1" value={selectedQuantity} onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)} />
              </div>
              <Button onClick={addToCart} type="button">Agregar</Button>
            </div>
            {cart.length > 0 && (
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr><th className="px-4 py-2 text-left font-medium">Producto</th><th className="w-24 px-4 py-2 text-right font-medium">Cant.</th><th className="w-32 px-4 py-2 text-right font-medium">Precio</th><th className="w-32 px-4 py-2 text-right font-medium">Subtotal</th><th className="w-16 px-4 py-2"></th></tr>
                  </thead>
                  <tbody>
                    {cart.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">{item.product.nombre}</td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">Q{item.product.precio_venta.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-medium">Q{(item.quantity * item.product.precio_venta).toFixed(2)}</td>
                        <td className="px-4 py-2 text-center">
                          <button onClick={() => removeFromCart(item.product.id_producto)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/20 font-bold">
                    <tr className="border-t"><td colSpan={3} className="px-4 py-3 text-right">TOTAL:</td><td className="px-4 py-3 text-right text-lg text-primary">Q{cartTotal.toFixed(2)}</td><td></td></tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || cart.length === 0 || !selectedClient}>{isSubmitting ? "Procesando..." : "Confirmar Venta"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
