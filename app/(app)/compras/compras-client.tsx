"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { DataTable, type Column } from "@/components/data-table"
import { RowActions } from "@/components/row-actions"
import { ShoppingBag, DollarSign, Receipt, Truck, Search, Plus, Eye, Printer, FileDown, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPurchase } from "@/app/actions/purchases"
import { exportCSV } from "@/lib/export-csv"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ComprasClient({ initialPurchases, initialProveedores, initialProductos }: { initialPurchases: any[]; initialProveedores: any[]; initialProductos: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const purchases = initialPurchases
  const proveedores = initialProveedores
  const productos = initialProductos

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailPurchase, setDetailPurchase] = useState<any>(null)
  
  // Nuevo pedido state
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [invoiceNumber, setInvoiceNumber] = useState<string>("")
  const [cart, setCart] = useState<{ product: any; quantity: number, cost: number, lote: string, vencimiento: string }[]>([])
  
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1)
  const [selectedCost, setSelectedCost] = useState<number>(0)
  const [selectedLote, setSelectedLote] = useState<string>("")
  const [selectedVencimiento, setSelectedVencimiento] = useState<string>("")
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const today = new Date().toISOString().split("T")[0]
  const todayPurchases = purchases.filter((s: any) => s.date.includes(today))
  const totalToday = todayPurchases.reduce((sum: number, s: any) => sum + s.total, 0)
  
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthPurchases = purchases.filter((s: any) => { 
    // basic parsing, assuming locale string contains month and year
    // For a more robust approach in production, we should pass raw_date
    return true; 
  })
  const totalMonth = purchases.reduce((sum: number, s: any) => sum + s.total, 0)

  const filteredPurchases = purchases.filter((s: any) =>
    s.provider.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.invoice.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenCreate = () => { 
    setSelectedProvider("")
    setInvoiceNumber("")
    setCart([])
    resetProductSelection()
    setIsModalOpen(true) 
  }

  const resetProductSelection = () => {
    setSelectedProduct("")
    setSelectedQuantity(1)
    setSelectedCost(0)
    setSelectedLote("")
    setSelectedVencimiento("")
  }

  const handleProductSelect = (val: string) => {
    setSelectedProduct(val)
    const product = productos.find((p: any) => p.id_producto.toString() === val)
    if (product) {
      setSelectedCost(product.precio_compra)
    }
  }

  const addToCart = () => {
    if (!selectedProduct) { toast.error("Seleccione un producto"); return }
    const product = productos.find((p: any) => p.id_producto.toString() === selectedProduct)
    if (!product) return
    if (selectedQuantity <= 0) { toast.error("La cantidad debe ser mayor a 0"); return }
    if (selectedCost < 0) { toast.error("El costo no puede ser negativo"); return }

    setCart([...cart, { 
      product, 
      quantity: selectedQuantity, 
      cost: selectedCost,
      lote: selectedLote,
      vencimiento: selectedVencimiento
    }])
    
    resetProductSelection()
  }

  const removeFromCart = (index: number) => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
  }
  
  const cartTotal = cart.reduce((sum, item) => sum + item.cost * item.quantity, 0)

  const handleSubmit = async () => {
    if (!selectedProvider) { toast.error("Seleccione un proveedor"); return }
    if (cart.length === 0) { toast.error("Agregue al menos un producto"); return }
    setIsSubmitting(true)
    try {
      const result = await createPurchase({
        id_proveedor: parseInt(selectedProvider), 
        numero_factura: invoiceNumber || null,
        total: cartTotal,
        detalles: cart.map((item) => ({ 
          id_producto: item.product.id_producto, 
          cantidad: item.quantity, 
          precio_unitario: item.cost, 
          subtotal: item.quantity * item.cost,
          numero_lote: item.lote || undefined,
          fecha_vencimiento: item.vencimiento || undefined
        })),
      })
      if (result.success) { 
        toast.success("Compra registrada exitosamente")
        setIsModalOpen(false)
        router.refresh() 
      } else {
        toast.error(result.error || "Error al registrar compra")
      }
    } catch { toast.error("Error inesperado") }
    finally { setIsSubmitting(false) }
  }

  const handleExport = () => {
    exportCSV("compras", ["No. Compra", "Fecha", "Proveedor", "NIT", "Factura", "Items", "Total"],
      filteredPurchases.map((s: any) => [s.id, s.date, s.provider, s.nit, s.invoice, s.items, s.total]))
  }

  const columns: Column<any>[] = [
    { key: "id", header: "No. Compra", render: (r) => <span className="font-medium">{r.id}</span> },
    { key: "date", header: "Fecha", render: (r) => <span className="text-muted-foreground">{r.date}</span> },
    { key: "provider", header: "Proveedor", render: (r) => r.provider },
    { key: "invoice", header: "Factura", render: (r) => r.invoice },
    { key: "items", header: "Items", render: (r) => r.items },
    { key: "total", header: "Total (Q)", render: (r) => <span className="font-medium">Q{r.total.toLocaleString("en", { minimumFractionDigits: 2 })}</span> },
    { key: "actions", header: "", render: (r) => (
      <RowActions actions={[
        { label: "Ver detalle", icon: Eye, onClick: () => setDetailPurchase(r) },
      ]} />
    )},
  ]

  return (
    <>
      <PageHeader icon={ShoppingBag} title="Gestión de Compras" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Compras Totales" value={purchases.length.toString()} icon={ShoppingBag} subtitle="Histórico" />
        <StatCard title="Inversión Total" value={`Q${totalMonth.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} subtitle="Valor histórico" />
        <StatCard title="Facturas Registradas" value={purchases.filter(p => p.invoice !== "--").length.toString()} icon={Receipt} subtitle="Con documento" />
        <StatCard title="Proveedores" value={proveedores.length.toString()} icon={Truck} subtitle="Activos en compras" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Registro de Compras</CardTitle>
          <CardDescription>Visualiza y registra el ingreso de mercadería al inventario</CardDescription>
          <CardAction>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}><FileDown className="mr-2 h-4 w-4" />Exportar</Button>
              <Button size="sm" onClick={handleOpenCreate}><Plus className="mr-2 h-4 w-4" />Nueva Compra</Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por proveedor, factura..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <DataTable columns={columns} data={filteredPurchases} rowKey={(r) => r.id} emptyIcon={ShoppingBag} emptyMessage="No se encontraron compras." />
        </CardContent>
      </Card>

      {/* Detalle de compra */}
      <Dialog open={detailPurchase !== null} onOpenChange={(open) => { if (!open) setDetailPurchase(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalle de Compra {detailPurchase?.id}</DialogTitle></DialogHeader>
          {detailPurchase && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Fecha:</span> {detailPurchase.date}</div>
                <div><span className="text-muted-foreground">Proveedor:</span> {detailPurchase.provider}</div>
                <div><span className="text-muted-foreground">NIT:</span> {detailPurchase.nit}</div>
                <div><span className="text-muted-foreground">Factura:</span> {detailPurchase.invoice}</div>
                <div><span className="text-muted-foreground">Items:</span> {detailPurchase.items}</div>
              </div>
              <div className="border-t pt-3">
                <p className="text-right text-lg font-bold">Total: Q{detailPurchase.total.toLocaleString("en", { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Nueva compra */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Registrar Nueva Compra / Ingreso</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Proveedor *</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger><SelectValue placeholder="Seleccione un proveedor..." /></SelectTrigger>
                  <SelectContent>
                    {proveedores.map((p: any) => (
                      <SelectItem key={p.id_proveedor} value={p.id_proveedor.toString()}>{p.nombre} (NIT: {p.nit || "C/F"})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>No. Factura (Opcional)</Label>
                <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="Ej. Serie A-123" />
              </div>
            </div>

            <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
              <h4 className="font-medium text-sm">Agregar Producto</h4>
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-12 md:col-span-5 space-y-2">
                  <Label>Producto</Label>
                  <Select value={selectedProduct} onValueChange={handleProductSelect}>
                    <SelectTrigger><SelectValue placeholder="Buscar producto..." /></SelectTrigger>
                    <SelectContent>
                      {productos.map((p: any) => (
                        <SelectItem key={p.id_producto} value={p.id_producto.toString()}>
                          {p.codigo} - {p.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-6 md:col-span-3 space-y-2">
                  <Label>Costo U. (Q)</Label>
                  <Input type="number" step="0.01" min="0" value={selectedCost} onChange={(e) => setSelectedCost(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="col-span-6 md:col-span-2 space-y-2">
                  <Label>Cantidad</Label>
                  <Input type="number" min="1" value={selectedQuantity} onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)} />
                </div>
                <div className="col-span-12 md:col-span-2">
                  <Button onClick={addToCart} type="button" className="w-full">Agregar</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="space-y-2">
                  <Label>No. Lote (Opcional)</Label>
                  <Input value={selectedLote} onChange={(e) => setSelectedLote(e.target.value)} placeholder="Generado autom. si se omite" />
                </div>
                <div className="space-y-2">
                  <Label>Vencimiento (Opcional)</Label>
                  <Input type="date" value={selectedVencimiento} onChange={(e) => setSelectedVencimiento(e.target.value)} />
                </div>
              </div>
            </div>

            {cart.length > 0 && (
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Producto</th>
                      <th className="px-4 py-2 text-left font-medium">Lote</th>
                      <th className="w-20 px-4 py-2 text-right font-medium">Cant.</th>
                      <th className="w-28 px-4 py-2 text-right font-medium">Costo U.</th>
                      <th className="w-28 px-4 py-2 text-right font-medium">Subtotal</th>
                      <th className="w-12 px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">
                          {item.product.nombre}
                          {item.vencimiento && <span className="block text-[10px] text-muted-foreground">Vence: {item.vencimiento}</span>}
                        </td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">{item.lote || "Auto"}</td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">Q{item.cost.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-medium">Q{(item.quantity * item.cost).toFixed(2)}</td>
                        <td className="px-4 py-2 text-center">
                          <button onClick={() => removeFromCart(idx)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/20 font-bold">
                    <tr className="border-t">
                      <td colSpan={4} className="px-4 py-3 text-right">TOTAL COMPRA:</td>
                      <td className="px-4 py-3 text-right text-lg text-primary">Q{cartTotal.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || cart.length === 0 || !selectedProvider}>{isSubmitting ? "Procesando..." : "Confirmar Ingreso"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
