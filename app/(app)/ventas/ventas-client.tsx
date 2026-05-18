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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createSale } from "@/app/actions/sales"
import { exportCSV } from "@/lib/export-csv"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function VentasClient({ initialSales, initialClientes, initialProductos, isCajaAbierta }: { initialSales: any[]; initialClientes: any[]; initialProductos: any[]; isCajaAbierta: boolean }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const sales = initialSales
  const clientes = initialClientes
  const productos = initialProductos

  const [viewMode, setViewMode] = useState<"list" | "create">("list")
  const [detailSale, setDetailSale] = useState<any>(null)

  // Create Sale State
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [newClientData, setNewClientData] = useState({ nombre: "", nit: "" })
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([])
  const [discountAmount, setDiscountAmount] = useState<number | "">("")

  const [productSearch, setProductSearch] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedQuantity, setSelectedQuantity] = useState<number | "">(1)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const today = new Date().toISOString().split("T")[0]
  const todaySales = sales.filter((s: any) => s.date === today)
  const totalToday = todaySales.reduce((sum: number, s: any) => sum + s.total, 0)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthSales = sales.filter((s: any) => { const d = new Date(s.date); return d.getMonth() === currentMonth && d.getFullYear() === currentYear })
  const totalMonth = monthSales.reduce((sum: number, s: any) => sum + s.total, 0)
  const uniqueClientsMonth = new Set(monthSales.map((s: any) => s.client)).size

  const filteredSales = sales.filter((s: any) => {
    const matchesSearch = s.client.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.nit.toLowerCase().includes(search.toLowerCase());

    const matchesDate = dateFilter ? s.date.includes(dateFilter) : true;

    return matchesSearch && matchesDate;
  })

  const handleOpenCreate = () => {
    if (!isCajaAbierta) {
      toast.error("Debe abrir caja desde Finanzas antes de operar.");
      return;
    }
    setSelectedClient("");
    setNewClientData({ nombre: "", nit: "" });
    setCart([]);
    setSelectedProduct(null);
    setProductSearch("");
    setSelectedQuantity(1);
    setDiscountAmount("");
    setViewMode("create");
  }

  const searchedProducts = productSearch.trim().length >= 2
    ? productos.filter((p: any) =>
      p.nombre?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(productSearch.toLowerCase())
    )
    : []

  const addToCart = () => {
    if (!selectedProduct) { toast.error("Seleccione un producto"); return }
    const qty = Number(selectedQuantity)
    if (qty <= 0) { toast.error("La cantidad debe ser mayor a 0"); return }
    if (qty > selectedProduct.stock_disponible) { toast.error(`No hay suficiente stock. Disponible: ${selectedProduct.stock_disponible}`); return }

    const existing = cart.find((item) => item.product.id_producto === selectedProduct.id_producto)
    if (existing) {
      const newQ = existing.quantity + qty
      if (newQ > selectedProduct.stock_disponible) { toast.error("La suma excede el stock disponible"); return }
      setCart(cart.map((item) => item.product.id_producto === selectedProduct.id_producto ? { ...item, quantity: newQ } : item))
    } else {
      setCart([...cart, { product: selectedProduct, quantity: qty }])
    }
    setSelectedProduct(null)
    setProductSearch("")
    setSelectedQuantity(1)
  }

  const removeFromCart = (productId: number) => setCart(cart.filter((item) => item.product.id_producto !== productId))
  const cartTotal = cart.reduce((sum, item) => sum + item.product.precio_venta * item.quantity, 0)
  const finalTotal = Math.max(0, cartTotal - (Number(discountAmount) || 0));

  const selectedClientData = clientes.find((c: any) => c.id_cliente.toString() === selectedClient);
  const isWholesale = selectedClientData?.tipo_cliente === "Mayorista";

  const handleSubmit = async () => {
    setConfirmOpen(false)
    if (!selectedClient) { toast.error("Seleccione un cliente"); return }
    if (selectedClient === "NEW" && !newClientData.nombre.trim()) {
      toast.error("El nombre del nuevo cliente es obligatorio");
      return;
    }
    if (cart.length === 0) { toast.error("Agregue al menos un producto"); return }
    setIsSubmitting(true)
    try {
      const result = await createSale({
        id_cliente: selectedClient === "NEW" ? undefined : parseInt(selectedClient),
        nuevo_cliente: selectedClient === "NEW" ? newClientData : undefined,
        total: finalTotal,
        descuento: Number(discountAmount) || 0,
        detalles: cart.map((item) => ({ id_producto: item.product.id_producto, cantidad: item.quantity, precio_unitario: item.product.precio_venta, subtotal: item.quantity * item.product.precio_venta })),
      })
      if (result.success) {
        toast.success("Venta registrada exitosamente");
        setViewMode("list");
        router.refresh();
      }
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
    {
      key: "actions", header: "", render: (r) => (
        <RowActions actions={[
          { label: "Ver detalle", icon: Eye, onClick: () => setDetailSale(r) },
          { label: "Imprimir", icon: Printer, onClick: () => handlePrint(r) },
        ]} />
      )
    },
  ]

  if (viewMode === "create") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-primary">Nueva Venta (Punto de Venta)</h2>
            <p className="text-muted-foreground mt-1">Busque productos, arme su carrito y registre la venta</p>
          </div>
          <Button variant="outline" onClick={() => setViewMode("list")}>Volver al Listado</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Lado Izquierdo: Buscador y Selección de Producto */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <Card className="border-t-4 border-t-primary shadow-md">
              <CardHeader className="pb-3 bg-muted/20">
                <CardTitle className="text-lg">Buscar Producto</CardTitle>
                <CardDescription>Escriba el nombre, código o una palabra clave (min. 2 letras)</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-14 pl-10 text-lg bg-background border-2 shadow-sm rounded-xl focus-visible:ring-primary"
                    placeholder="Buscar producto por nombre, código o descripción..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>

                {searchedProducts.length > 0 && !selectedProduct && (
                  <div className="border rounded-xl max-h-64 overflow-y-auto bg-background p-2 space-y-2 shadow-inner">
                    {searchedProducts.map((p: any) => (
                      <button
                        key={p.id_producto}
                        onClick={() => setSelectedProduct(p)}
                        disabled={p.stock_disponible <= 0}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${p.stock_disponible <= 0
                            ? 'opacity-50 bg-destructive/5 border-destructive/20 cursor-not-allowed'
                            : 'hover:bg-primary/5 hover:border-primary/30 active:scale-[0.99]'
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-base">{p.nombre}</div>
                            <div className="text-xs text-muted-foreground mt-1">Código: {p.codigo} {p.descripcion ? `| ${p.descripcion}` : ""}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary text-lg">Q{p.precio_venta.toFixed(2)}</div>
                            <div className={`text-xs font-semibold mt-1 ${p.stock_disponible <= 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                              Stock: {p.stock_disponible}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {productSearch.trim().length >= 2 && searchedProducts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                    No se encontraron productos que coincidan con la búsqueda.
                  </div>
                )}

                {/* Producto Seleccionado - Ingreso de Cantidad */}
                {selectedProduct && (
                  <div className="mt-6 p-5 rounded-xl border-2 border-primary/20 bg-primary/5 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-bold text-xl text-primary">{selectedProduct.nombre}</h3>
                        <p className="text-sm text-muted-foreground">{selectedProduct.codigo} | Stock: {selectedProduct.stock_disponible}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)} className="h-8">Cambiar</Button>
                    </div>
                    <div className="flex items-end gap-4">
                      <div className="space-y-2 flex-1">
                        <Label className="font-bold">Cantidad a Vender</Label>
                        <Input
                          type="number"
                          min="1"
                          className="h-12 text-lg font-bold"
                          value={selectedQuantity}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedQuantity(val === "" ? "" : parseInt(val));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-muted-foreground">Precio Unitario</Label>
                        <div className="h-12 px-4 flex items-center rounded-md bg-muted font-medium text-lg">
                          Q{selectedProduct.precio_venta.toFixed(2)}
                        </div>
                      </div>
                      <Button
                        onClick={addToCart}
                        size="lg"
                        className="h-12 px-8 text-base font-bold shadow-md"
                        disabled={selectedQuantity === "" || Number(selectedQuantity) <= 0 || Number(selectedQuantity) > selectedProduct.stock_disponible}
                      >
                        <Plus className="mr-2 h-5 w-5" /> Agregar al Carrito
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lado Derecho: Carrito y Cierre */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <Card className="shadow-lg border-primary/10">
              <CardHeader className="bg-primary/5 border-b pb-4">
                <CardTitle className="text-xl flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /> Datos de Venta</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-5 border-b space-y-3">
                  <Label className="font-bold">Cliente *</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Seleccione un cliente..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW" className="font-bold text-primary border-b mb-1">
                        + Crear Nuevo Cliente
                      </SelectItem>
                      {clientes.map((c: any) => (
                        <SelectItem key={c.id_cliente} value={c.id_cliente.toString()}>
                          <span className="font-medium">{c.nombre}</span> <span className="text-muted-foreground">(NIT: {c.nit || "C/F"})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedClient === "NEW" && (
                    <div className="grid grid-cols-2 gap-3 mt-3 animate-in fade-in zoom-in-95 p-3 bg-muted/30 rounded-lg border">
                      <div className="space-y-1">
                        <Label className="text-xs">Nombre completo *</Label>
                        <Input
                          placeholder="Juan Pérez"
                          value={newClientData.nombre}
                          onChange={(e) => setNewClientData({ ...newClientData, nombre: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">NIT</Label>
                        <Input
                          placeholder="Opcional (Ej. C/F)"
                          value={newClientData.nit}
                          onChange={(e) => setNewClientData({ ...newClientData, nit: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="max-h-[350px] overflow-y-auto p-2 bg-muted/5">
                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                      <ShoppingCart className="h-12 w-12 mb-3 opacity-20" />
                      <p>El carrito está vacío</p>
                      <p className="text-xs mt-1">Busque y agregue productos</p>
                    </div>
                  ) : (
                    <div className="space-y-2 p-3">
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex flex-col bg-background border rounded-lg p-3 shadow-sm relative group">
                          <div className="flex justify-between items-start">
                            <div className="font-bold text-sm leading-tight pr-6">{item.product.nombre}</div>
                            <button onClick={() => removeFromCart(item.product.id_producto)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex justify-between items-end mt-2">
                            <div className="text-xs font-medium bg-muted/50 px-2 py-1 rounded">Cant: {item.quantity} x Q{item.product.precio_venta.toFixed(2)}</div>
                            <div className="font-bold text-primary">Q{(item.quantity * item.product.precio_venta).toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-primary/5 p-5 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-muted-foreground">SUBTOTAL:</span>
                    <span className="text-lg font-bold">Q{cartTotal.toFixed(2)}</span>
                  </div>

                  {isWholesale && (
                    <div className="flex justify-between items-center mb-4 pt-2 border-t">
                      <span className="text-sm font-bold text-muted-foreground flex items-center">
                        <Badge variant="secondary" className="mr-2 bg-amber-100 text-amber-800 border-amber-200">Mayorista</Badge>
                        Descuento:
                      </span>
                      <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Q</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="h-9 pl-8 font-bold text-right text-destructive"
                          value={discountAmount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDiscountAmount(val === "" ? "" : parseFloat(val));
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-4 pt-2 border-t">
                    <span className="text-lg font-bold text-muted-foreground">TOTAL:</span>
                    <span className="text-3xl font-black text-primary">Q{finalTotal.toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={() => setConfirmOpen(true)}
                    disabled={isSubmitting || cart.length === 0 || !selectedClient}
                    className="w-full h-14 text-lg font-bold shadow-lg"
                  >
                    Confirmar Venta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal Confirmación Venta */}
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar Registro de Venta?</AlertDialogTitle>
              <AlertDialogDescription>
                Está a punto de registrar la venta por un total de <strong>Q{finalTotal.toFixed(2)}</strong> para el cliente seleccionado.
                {Number(discountAmount) > 0 && <span> Se aplicará un descuento de <strong>Q{Number(discountAmount).toFixed(2)}</strong>.</span>}
                Esto rebajará inmediatamente el stock del inventario.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Revisar de nuevo</AlertDialogCancel>
              <AlertDialogAction onClick={(e) => { e.preventDefault(); handleSubmit(); }} disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isSubmitting ? "Procesando..." : "Sí, Registrar Venta"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    )
  }

  return (
    <>
      <PageHeader icon={ShoppingCart} title="Gestión de Ventas" />

      {!isCajaAbierta && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-lg border border-destructive/30 flex items-center mb-6">
          <div className="mr-3 p-2 bg-destructive/20 rounded-full">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">La caja está cerrada</h3>
            <p className="text-sm opacity-90">Debe abrir la caja desde el módulo de Finanzas antes de poder registrar nuevas ventas.</p>
          </div>
        </div>
      )}

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
              <Button size="sm" onClick={handleOpenCreate} className={!isCajaAbierta ? "opacity-50 cursor-not-allowed" : ""}><Plus className="mr-2 h-4 w-4" />Nueva Venta</Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por cliente, NIT, No. venta..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="relative w-full sm:w-auto">
              <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full sm:w-[200px]" />
              {dateFilter && (
                <button onClick={() => setDateFilter("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-medium">Limpiar</button>
              )}
            </div>
          </div>
          <DataTable columns={columns} data={filteredSales} rowKey={(r) => r.id} emptyIcon={ShoppingCart} emptyMessage="No se encontraron ventas." />
        </CardContent>
      </Card>

      {/* Detalle de venta */}
      <Dialog open={detailSale !== null} onOpenChange={(open) => { if (!open) setDetailSale(null) }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle className="text-xl">Detalle de Venta {detailSale?.id}</DialogTitle></DialogHeader>
          {detailSale && (
            <div className="space-y-6 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg">
                <div><span className="text-muted-foreground block text-xs mb-1">Fecha</span> <span className="font-medium">{detailSale.date}</span></div>
                <div><span className="text-muted-foreground block text-xs mb-1">Cliente</span> <span className="font-medium">{detailSale.client}</span></div>
                <div><span className="text-muted-foreground block text-xs mb-1">NIT</span> <span className="font-medium">{detailSale.nit}</span></div>
                <div><span className="text-muted-foreground block text-xs mb-1">Pago</span> <span className="font-medium">{detailSale.payment}</span></div>
                <div><span className="text-muted-foreground block text-xs mb-1">Total de Items</span> <span className="font-medium">{detailSale.items}</span></div>
                <div><span className="text-muted-foreground block text-xs mb-1">Estado</span> <span className="font-medium">{detailSale.status}</span></div>
              </div>

              <div className="rounded-lg border bg-card overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground font-medium">Subtotal</span>
                    <span className="font-bold">Q{(detailSale.total + (detailSale.discount || 0)).toLocaleString("en", { minimumFractionDigits: 2 })}</span>
                  </div>

                  {detailSale.discount > 0 && (
                    <div className="flex justify-between text-base text-destructive bg-destructive/5 p-2 rounded-md -mx-2">
                      <span className="font-medium">Descuento Aplicado</span>
                      <span className="font-bold">- Q{detailSale.discount.toLocaleString("en", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>

                <div className="bg-primary/5 p-4 flex justify-between items-center border-t">
                  <span className="text-lg font-black text-primary">Total Final</span>
                  <span className="text-2xl font-black text-primary">Q{detailSale.total.toLocaleString("en", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
