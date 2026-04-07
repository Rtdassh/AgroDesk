"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import {
  ShoppingCart,
  DollarSign,
  Receipt,
  Users,
  Search,
  Plus,
  Eye,
  Printer,
  FileDown,
  Trash2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createSale } from "@/app/actions/sales"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function VentasClient({ initialSales, initialClientes, initialProductos }: { initialSales: any[], initialClientes: any[], initialProductos: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")

  const sales = initialSales
  const clientes = initialClientes
  const productos = initialProductos

  // Modal de Nueva Venta
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Stats
  const today = new Date().toISOString().split("T")[0]
  const todaySales = sales.filter(s => s.date === today)
  const totalToday = todaySales.reduce((sum, s) => sum + s.total, 0)
  
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthSales = sales.filter(s => {
    const d = new Date(s.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })
  const totalMonth = monthSales.reduce((sum, s) => sum + s.total, 0)
  
  const uniqueClientsMonth = new Set(monthSales.map(s => s.client)).size

  const filteredSales = sales.filter(s => 
    s.client.toLowerCase().includes(search.toLowerCase()) || 
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.nit.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenCreate = () => {
    setSelectedClient("")
    setCart([])
    setSelectedProduct("")
    setSelectedQuantity(1)
    setIsModalOpen(true)
  }

  const addToCart = () => {
    if (!selectedProduct) {
      toast.error("Seleccione un producto")
      return
    }
    const product = productos.find(p => p.id_producto.toString() === selectedProduct)
    if (!product) return

    if (selectedQuantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0")
      return
    }

    if (selectedQuantity > product.stock_disponible) {
      toast.error("No hay suficiente stock")
      return
    }

    const existingItem = cart.find(item => item.product.id_producto === product.id_producto)
    if (existingItem) {
      const newQuantity = existingItem.quantity + selectedQuantity
      if (newQuantity > product.stock_disponible) {
        toast.error("La suma excede el stock disponible")
        return
      }
      setCart(cart.map(item => 
        item.product.id_producto === product.id_producto 
          ? { ...item, quantity: newQuantity } 
          : item
      ))
    } else {
      setCart([...cart, { product, quantity: selectedQuantity }])
    }
    
    setSelectedProduct("")
    setSelectedQuantity(1)
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id_producto !== productId))
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.precio_venta * item.quantity), 0)

  const handleSubmit = async () => {
    if (!selectedClient) {
      toast.error("Seleccione un cliente")
      return
    }
    if (cart.length === 0) {
      toast.error("Agregue al menos un producto a la venta")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createSale({
        id_cliente: parseInt(selectedClient),
        total: cartTotal,
        detalles: cart.map(item => ({
          id_producto: item.product.id_producto,
          cantidad: item.quantity,
          precio_unitario: item.product.precio_venta,
          subtotal: item.quantity * item.product.precio_venta
        }))
      })

      if (result.success) {
        toast.success("Venta registrada exitosamente")
        setIsModalOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Error al registrar la venta")
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell>
      <PageHeader icon={ShoppingCart} title="Gestion de Ventas" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Ventas del Dia" value={`Q${totalToday.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={ShoppingCart} subtitle={`${todaySales.length} ventas realizadas`} />
        <StatCard title="Ingresos Mes" value={`Q${totalMonth.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} subtitle="Mes actual" />
        <StatCard title="Facturas Emitidas" value={monthSales.length.toString()} icon={Receipt} subtitle="En el mes actual" />
        <StatCard title="Clientes Atendidos" value={uniqueClientsMonth.toString()} icon={Users} subtitle="Clientes unicos este mes" />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Registro de Ventas</h2>
            <p className="text-sm text-muted-foreground">Busqueda inteligente de ventas, generacion de factura/comprobante</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button size="sm" onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Venta
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-5 pb-4 md:flex-row md:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar por cliente, NIT, No. venta..." 
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
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">No. Venta</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">NIT</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Items</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Total (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Pago</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No se encontraron ventas.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-t border-border">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{sale.id}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{sale.date}</td>
                    <td className="px-5 py-3 text-sm text-foreground">{sale.client}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{sale.nit}</td>
                    <td className="px-5 py-3 text-sm text-foreground">{sale.items}</td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">Q{sale.total.toLocaleString("en", { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-3">
                      <Badge variant={sale.payment === "Credito" ? "secondary" : "outline"}>
                        {sale.payment}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={sale.status === "Anulada" ? "destructive" : sale.status === "Pendiente" ? "secondary" : "outline"}>
                        {sale.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Venta</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(c => (
                    <SelectItem key={c.id_cliente} value={c.id_cliente.toString()}>
                      {c.nombre} (NIT: {c.nit || 'C/F'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-3 p-4 border rounded-lg bg-muted/20">
              <div className="flex-1 space-y-2">
                <Label>Producto</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Buscar producto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map(p => (
                      <SelectItem key={p.id_producto} value={p.id_producto.toString()} disabled={p.stock_disponible <= 0}>
                        {p.codigo} - {p.nombre} (Stock: {p.stock_disponible}) - Q{p.precio_venta}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24 space-y-2">
                <Label>Cantidad</Label>
                <Input 
                  type="number" 
                  min="1" 
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <Button onClick={addToCart} type="button">Agregar</Button>
            </div>

            {cart.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Producto</th>
                      <th className="px-4 py-2 text-right font-medium w-24">Cant.</th>
                      <th className="px-4 py-2 text-right font-medium w-32">Precio</th>
                      <th className="px-4 py-2 text-right font-medium w-32">Subtotal</th>
                      <th className="px-4 py-2 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">{item.product.nombre}</td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">Q{item.product.precio_venta.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-medium">Q{(item.quantity * item.product.precio_venta).toFixed(2)}</td>
                        <td className="px-4 py-2 text-center">
                          <button 
                            onClick={() => removeFromCart(item.product.id_producto)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/20 font-bold">
                    <tr className="border-t">
                      <td colSpan={3} className="px-4 py-3 text-right">TOTAL:</td>
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
            <Button onClick={handleSubmit} disabled={isSubmitting || cart.length === 0 || !selectedClient}>
              {isSubmitting ? "Procesando..." : "Confirmar Venta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
