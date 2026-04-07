"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Package, DollarSign, AlertTriangle, Search, Plus, FileDown, FileSpreadsheet, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { addProduct, updateProduct, deleteProduct } from "@/app/actions/inventory"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function InventarioClient({ initialProducts }: { initialProducts: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const products = initialProducts

  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + p.total, 0)
  const lowStock = products.filter((p) => p.status === "Critico" || p.status === "Bajo").length

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product: any) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este producto?")) return

    try {
      const result = await deleteProduct(id)
      if (result.success) {
        toast.success("Producto eliminado exitosamente")
        router.refresh()
      } else {
        toast.error(result.error || "Error al eliminar producto")
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      let result
      if (editingProduct) {
        result = await updateProduct(editingProduct.no, formData)
      } else {
        result = await addProduct(formData)
      }

      if (result.success) {
        toast.success(`Producto ${editingProduct ? 'actualizado' : 'creado'} exitosamente`)
        setIsModalOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || `Error al ${editingProduct ? 'actualizar' : 'crear'} producto`)
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell>
      <PageHeader icon={Package} title="Gestion de Inventario" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Productos" value={totalProducts.toString()} icon={Package} />
        <StatCard title="Valor Total" value={`Q${totalValue.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} />
        <StatCard title="Stock Bajo" value={lowStock.toString()} icon={AlertTriangle} />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Productos en Inventario</h2>
            <p className="text-sm text-muted-foreground">Gestiona tu inventario de productos</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar Formato SAT
            </Button>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Button size="sm" onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Producto
            </Button>
          </div>
        </div>

        <div className="px-5 pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar productos..." 
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
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">No.</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Codigo</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Producto</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Proveedor</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">No. Factura</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Cantidad</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Precio Compra (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Total (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No se encontraron productos.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.no} className="border-t border-border">
                    <td className="px-5 py-3 text-sm text-foreground">{product.no}</td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{product.code}</td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-semibold text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.desc}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{product.supplier}</td>
                    <td className="px-5 py-3 text-sm text-foreground">{product.invoice}</td>
                    <td className="px-5 py-3 text-sm text-foreground">{product.qty}</td>
                    <td className="px-5 py-3 text-sm text-foreground">Q{Number(product.price).toFixed(2)}</td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">Q{Number(product.total).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <Badge variant={product.status === "Critico" ? "destructive" : product.status === "Bajo" ? "secondary" : "outline"}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(product)}
                          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.no)}
                          className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input 
                  id="codigo" 
                  name="codigo" 
                  required 
                  defaultValue={editingProduct?.code || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Producto</Label>
                <Input 
                  id="nombre" 
                  name="nombre" 
                  required 
                  defaultValue={editingProduct?.name || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio_compra">Precio de Compra</Label>
                <Input 
                  id="precio_compra" 
                  name="precio_compra" 
                  type="number" 
                  step="0.01" 
                  required 
                  defaultValue={editingProduct?.price || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio_venta">Precio de Venta</Label>
                <Input 
                  id="precio_venta" 
                  name="precio_venta" 
                  type="number" 
                  step="0.01" 
                  required 
                  defaultValue={editingProduct?.precio_venta || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_minimo">Stock Mínimo</Label>
                <Input 
                  id="stock_minimo" 
                  name="stock_minimo" 
                  type="number" 
                  required 
                  defaultValue={editingProduct?.stock_minimo || "0"}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
