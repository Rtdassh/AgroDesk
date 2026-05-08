"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { DataTable, type Column } from "@/components/data-table"
import { RowActions } from "@/components/row-actions"
import { Truck, Package, DollarSign, FileText, Search, Plus, FileDown, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { addSupplier, updateSupplier, deleteSupplier } from "@/app/actions/suppliers"
import { exportCSV } from "@/lib/export-csv"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ProveedoresClient({ initialSuppliers }: { initialSuppliers: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const suppliers = initialSuppliers
  const totalPending = suppliers.reduce((sum: number, s: any) => sum + s.pending, 0)
  const totalProducts = suppliers.reduce((sum: number, s: any) => sum + s.products, 0)
  const pendingInvoices = suppliers.filter((s: any) => s.pending > 0).length

  const filteredSuppliers = suppliers.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenCreate = () => { setEditingSupplier(null); setIsModalOpen(true) }
  const handleOpenEdit = (supplier: any) => { setEditingSupplier(supplier); setIsModalOpen(true) }

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteSupplier(id)
      if (result.success) { toast.success("Proveedor eliminado"); router.refresh() }
      else toast.error(result.error || "Error al eliminar")
    } catch { toast.error("Error inesperado") }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      const result = editingSupplier
        ? await updateSupplier(editingSupplier.raw_id, formData)
        : await addSupplier(formData)
      if (result.success) {
        toast.success(`Proveedor ${editingSupplier ? "actualizado" : "creado"} exitosamente`)
        setIsModalOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Error al guardar")
      }
    } catch { toast.error("Error inesperado") }
    finally { setIsSubmitting(false) }
  }

  const handleExport = () => {
    exportCSV("proveedores", ["ID", "Proveedor", "Contacto", "Telefono", "Productos", "Saldo Pend.", "Ult. Pedido", "Estado"],
      filteredSuppliers.map((s: any) => [s.id, s.name, s.contact, s.phone, s.products, s.pending, s.lastOrder, s.status]))
  }

  const columns: Column<any>[] = [
    { key: "id", header: "ID", render: (r) => <span className="font-medium">{r.id}</span> },
    { key: "name", header: "Proveedor", render: (r) => (
      <div><p className="font-semibold">{r.name}</p><p className="text-xs text-muted-foreground">{r.email}</p></div>
    )},
    { key: "contact", header: "Contacto", render: (r) => <span className="text-muted-foreground">{r.contact}</span> },
    { key: "phone", header: "Telefono", render: (r) => <span className="text-muted-foreground">{r.phone}</span> },
    { key: "products", header: "Productos", render: (r) => r.products },
    { key: "pending", header: "Saldo Pend. (Q)", render: (r) => <span className="font-medium">Q{r.pending.toLocaleString("en", { minimumFractionDigits: 2 })}</span> },
    { key: "lastOrder", header: "Ult. Pedido", render: (r) => <span className="text-muted-foreground">{r.lastOrder}</span> },
    { key: "status", header: "Estado", render: (r) => <Badge variant={r.status === "Inactivo" ? "secondary" : "outline"}>{r.status}</Badge> },
    { key: "actions", header: "", render: (r) => (
      <RowActions
        actions={[{ label: "Editar", icon: Pencil, onClick: () => handleOpenEdit(r) }]}
        deleteConfig={{ title: "Eliminar proveedor", description: "El proveedor sera eliminado permanentemente. Esta accion no se puede deshacer.", onConfirm: () => handleDelete(r.raw_id) }}
      />
    )},
  ]

  return (
    <>
      <PageHeader icon={Truck} title="Gestion de Proveedores" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Proveedores" value={suppliers.length.toString()} icon={Truck} subtitle="Proveedores registrados" />
        <StatCard title="Productos Asociados" value={totalProducts.toString()} icon={Package} subtitle="De todos los proveedores" />
        <StatCard title="Cuentas por Pagar" value={`Q${totalPending.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} subtitle="Total pendiente de pago" />
        <StatCard title="Facturas Pendientes" value={pendingInvoices.toString()} icon={FileText} subtitle="Facturas sin procesar" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Directorio de Proveedores</CardTitle>
          <CardDescription>Registro, historial de compras y control de facturas</CardDescription>
          <CardAction>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />Exportar
              </Button>
              <Button size="sm" onClick={handleOpenCreate}>
                <Plus className="mr-2 h-4 w-4" />Nuevo Proveedor
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar proveedores..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <DataTable columns={columns} data={filteredSuppliers} rowKey={(r) => r.id} emptyIcon={Truck} emptyMessage="No se encontraron proveedores." />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="nombre">Nombre de la Empresa</Label>
                <Input id="nombre" name="nombre" required defaultValue={editingSupplier?.name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nit">NIT</Label>
                <Input id="nit" name="nit" defaultValue={editingSupplier?.nit !== "--" ? editingSupplier?.nit : ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contacto">Nombre de Contacto</Label>
                <Input id="contacto" name="contacto" defaultValue={editingSupplier?.contact !== "--" ? editingSupplier?.contact : ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Telefono</Label>
                <Input id="telefono" name="telefono" defaultValue={editingSupplier?.phone !== "--" ? editingSupplier?.phone : ""} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="direccion">Direccion (Email/Fisica)</Label>
                <Input id="direccion" name="direccion" defaultValue={editingSupplier?.address !== "--" ? editingSupplier?.address : ""} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Guardando..." : "Guardar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
