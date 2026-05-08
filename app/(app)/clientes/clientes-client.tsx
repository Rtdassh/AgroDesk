"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { DataTable, type Column } from "@/components/data-table"
import { RowActions } from "@/components/row-actions"
import { UserCheck, Users, AlertTriangle, DollarSign, Search, Plus, FileDown, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addClient, updateClient, deleteClient } from "@/app/actions/clients"
import { exportCSV } from "@/lib/export-csv"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ClientesClient({ initialClients }: { initialClients: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clients = initialClients
  const totalClients = clients.length
  const inMora = clients.filter((c: any) => c.status === "Mora" || c.status === "Con Credito").length
  const totalDebt = clients.reduce((sum: number, c: any) => sum + c.balance, 0)
  const wholesaleClients = clients.filter((c: any) => c.type === "Mayorista").length

  const filteredClients = clients.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.nit.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenCreate = () => { setEditingClient(null); setIsModalOpen(true) }
  const handleOpenEdit = (client: any) => { setEditingClient(client); setIsModalOpen(true) }

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteClient(id)
      if (result.success) { toast.success("Cliente eliminado"); router.refresh() }
      else toast.error(result.error || "Error al eliminar")
    } catch { toast.error("Error inesperado") }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      const result = editingClient
        ? await updateClient(editingClient.raw_id, formData)
        : await addClient(formData)
      if (result.success) {
        toast.success(`Cliente ${editingClient ? "actualizado" : "creado"} exitosamente`)
        setIsModalOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Error al guardar")
      }
    } catch { toast.error("Error inesperado") }
    finally { setIsSubmitting(false) }
  }

  const handleExport = () => {
    exportCSV("clientes", ["ID", "Cliente", "NIT", "Tipo", "Telefono", "Compras", "Saldo", "Ult. Compra", "Estado"],
      filteredClients.map((c: any) => [c.id, c.name, c.nit, c.type, c.phone, c.purchases, c.balance, c.lastPurchase, c.status]))
  }

  const columns: Column<any>[] = [
    { key: "id", header: "ID", render: (r) => <span className="font-medium">{r.id}</span> },
    { key: "name", header: "Cliente", render: (r) => r.name },
    { key: "nit", header: "NIT", render: (r) => <span className="text-muted-foreground">{r.nit}</span> },
    { key: "type", header: "Tipo", render: (r) => <Badge variant={r.type === "Mayorista" ? "secondary" : "outline"}>{r.type}</Badge> },
    { key: "phone", header: "Telefono", render: (r) => <span className="text-muted-foreground">{r.phone}</span> },
    { key: "purchases", header: "Compras", render: (r) => r.purchases },
    { key: "balance", header: "Saldo (Q)", render: (r) => <span className="font-medium">Q{r.balance.toLocaleString("en", { minimumFractionDigits: 2 })}</span> },
    { key: "lastPurchase", header: "Ult. Compra", render: (r) => <span className="text-muted-foreground">{r.lastPurchase}</span> },
    { key: "status", header: "Estado", render: (r) => <Badge variant={r.status === "Mora" ? "destructive" : r.status === "Con Credito" ? "secondary" : "outline"}>{r.status}</Badge> },
    { key: "actions", header: "", render: (r) => (
      <RowActions
        actions={[{ label: "Editar", icon: Pencil, onClick: () => handleOpenEdit(r) }]}
        deleteConfig={{ title: "Eliminar cliente", description: "El cliente sera eliminado permanentemente. Esta accion no se puede deshacer.", onConfirm: () => handleDelete(r.raw_id) }}
      />
    )},
  ]

  return (
    <>
      <PageHeader icon={UserCheck} title="Gestion de Clientes" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Clientes" value={totalClients.toString()} icon={Users} subtitle="Clientes registrados" />
        <StatCard title="Clientes Mayoristas" value={wholesaleClients.toString()} icon={UserCheck} subtitle="Con precio especial" />
        <StatCard title="Cuentas por Cobrar" value={`Q${totalDebt.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} subtitle="Total saldos pendientes" />
        <StatCard title="Clientes en Mora" value={inMora.toString()} icon={AlertTriangle} subtitle="Requieren seguimiento" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Directorio de Clientes</CardTitle>
          <CardDescription>Registro, historial de compras y estado de cuenta</CardDescription>
          <CardAction>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />Exportar
              </Button>
              <Button size="sm" onClick={handleOpenCreate}>
                <Plus className="mr-2 h-4 w-4" />Nuevo Cliente
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nombre, NIT..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <DataTable columns={columns} data={filteredClients} rowKey={(r) => r.id} emptyIcon={Users} emptyMessage="No se encontraron clientes." />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClient ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input id="nombre" name="nombre" required defaultValue={editingClient?.name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nit">NIT</Label>
                <Input id="nit" name="nit" defaultValue={editingClient?.nit !== "C/F" ? editingClient?.nit : ""} placeholder="C/F si esta vacio" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_cliente">Tipo de Cliente</Label>
                <Select name="tipo_cliente" defaultValue={editingClient?.type || "Minorista"}>
                  <SelectTrigger><SelectValue placeholder="Seleccione el tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minorista">Minorista</SelectItem>
                    <SelectItem value="Mayorista">Mayorista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Telefono</Label>
                <Input id="telefono" name="telefono" defaultValue={editingClient?.phone !== "--" ? editingClient?.phone : ""} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="direccion">Direccion</Label>
                <Input id="direccion" name="direccion" defaultValue={editingClient?.address !== "--" ? editingClient?.address : ""} />
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
