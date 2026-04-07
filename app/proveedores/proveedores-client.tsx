"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import {
  Truck,
  Package,
  DollarSign,
  FileText,
  Search,
  Plus,
  Pencil,
  FileDown,
  Trash2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { addSupplier, updateSupplier, deleteSupplier } from "@/app/actions/suppliers"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ProveedoresClient({ initialSuppliers }: { initialSuppliers: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const suppliers = initialSuppliers

  const totalPending = suppliers.reduce((sum, s) => sum + s.pending, 0)
  const totalProducts = suppliers.reduce((sum, s) => sum + s.products, 0) // or static if not computed
  const pendingInvoices = suppliers.filter(s => s.pending > 0).length

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.contact.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenCreate = () => {
    setEditingSupplier(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (supplier: any) => {
    setEditingSupplier(supplier)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este proveedor?")) return

    try {
      const result = await deleteSupplier(id)
      if (result.success) {
        toast.success("Proveedor eliminado exitosamente")
        router.refresh()
      } else {
        toast.error(result.error || "Error al eliminar proveedor")
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
      if (editingSupplier) {
        result = await updateSupplier(editingSupplier.raw_id, formData)
      } else {
        result = await addSupplier(formData)
      }

      if (result.success) {
        toast.success(`Proveedor ${editingSupplier ? 'actualizado' : 'creado'} exitosamente`)
        setIsModalOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || `Error al ${editingSupplier ? 'actualizar' : 'crear'} proveedor`)
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell>
      <PageHeader icon={Truck} title="Gestion de Proveedores" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Proveedores" value={suppliers.length.toString()} icon={Truck} subtitle="Proveedores registrados" />
        <StatCard title="Productos Asociados" value={totalProducts.toString()} icon={Package} subtitle="De todos los proveedores" />
        <StatCard title="Cuentas por Pagar" value={`Q${totalPending.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} subtitle="Total pendiente de pago" />
        <StatCard title="Facturas Pendientes" value={pendingInvoices.toString()} icon={FileText} subtitle="Facturas sin procesar" />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Directorio de Proveedores</h2>
            <p className="text-sm text-muted-foreground">Registro, historial de compras y control de facturas</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button size="sm" onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Proveedor
            </Button>
          </div>
        </div>

        <div className="px-5 pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar proveedores..." 
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
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Proveedor</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Contacto</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Telefono</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Productos</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Saldo Pend. (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Ult. Pedido</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No se encontraron proveedores.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-t border-border">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{supplier.id}</td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-semibold text-foreground">{supplier.name}</p>
                      <p className="text-xs text-muted-foreground">{supplier.email}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{supplier.contact}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{supplier.phone}</td>
                    <td className="px-5 py-3 text-sm text-foreground">{supplier.products}</td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      Q{supplier.pending.toLocaleString("en", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{supplier.lastOrder}</td>
                    <td className="px-5 py-3">
                      <Badge variant={supplier.status === "Inactivo" ? "secondary" : "outline"}>
                        {supplier.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(supplier)}
                          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(supplier.raw_id)}
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
            <DialogTitle>{editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="nombre">Nombre de la Empresa</Label>
                <Input 
                  id="nombre" 
                  name="nombre" 
                  required 
                  defaultValue={editingSupplier?.name || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nit">NIT</Label>
                <Input 
                  id="nit" 
                  name="nit" 
                  defaultValue={editingSupplier?.nit !== "--" ? editingSupplier?.nit : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contacto">Nombre de Contacto</Label>
                <Input 
                  id="contacto" 
                  name="contacto" 
                  defaultValue={editingSupplier?.contact !== "--" ? editingSupplier?.contact : ""}
                />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input 
                  id="telefono" 
                  name="telefono" 
                  defaultValue={editingSupplier?.phone !== "--" ? editingSupplier?.phone : ""}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="direccion">Dirección (Email/Física)</Label>
                <Input 
                  id="direccion" 
                  name="direccion" 
                  defaultValue={editingSupplier?.address !== "--" ? editingSupplier?.address : ""}
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
