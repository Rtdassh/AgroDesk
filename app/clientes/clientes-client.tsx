"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import {
  UserCheck,
  Users,
  AlertTriangle,
  DollarSign,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addClient, updateClient, deleteClient } from "@/app/actions/clients"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ClientesClient({ initialClients }: { initialClients: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clients = initialClients

  const totalClients = clients.length
  const inMora = clients.filter((c) => c.status === "Mora" || c.status === "Con Credito").length
  const totalDebt = clients.reduce((sum, c) => sum + c.balance, 0)
  const wholesaleClients = clients.filter(c => c.type === "Mayorista").length

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.nit.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenCreate = () => {
    setEditingClient(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (client: any) => {
    setEditingClient(client)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este cliente?")) return

    try {
      const result = await deleteClient(id)
      if (result.success) {
        toast.success("Cliente eliminado exitosamente")
        router.refresh()
      } else {
        toast.error(result.error || "Error al eliminar cliente")
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
      if (editingClient) {
        result = await updateClient(editingClient.raw_id, formData)
      } else {
        result = await addClient(formData)
      }

      if (result.success) {
        toast.success(`Cliente ${editingClient ? 'actualizado' : 'creado'} exitosamente`)
        setIsModalOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || `Error al ${editingClient ? 'actualizar' : 'crear'} cliente`)
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell>
      <PageHeader icon={UserCheck} title="Gestion de Clientes" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Clientes" value={totalClients.toString()} icon={Users} subtitle="Clientes registrados" />
        <StatCard title="Clientes Mayoristas" value={wholesaleClients.toString()} icon={UserCheck} subtitle="Con precio especial" />
        <StatCard title="Cuentas por Cobrar" value={`Q${totalDebt.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} subtitle="Total saldos pendientes" />
        <StatCard title="Clientes en Mora" value={inMora.toString()} icon={AlertTriangle} subtitle="Requieren seguimiento" />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Directorio de Clientes</h2>
            <p className="text-sm text-muted-foreground">Registro, historial de compras y estado de cuenta</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button size="sm" onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </div>
        </div>

        <div className="px-5 pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre, NIT..." 
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
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">NIT</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Tipo</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Telefono</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Compras</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Saldo (Q)</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Ult. Compra</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No se encontraron clientes.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="border-t border-border">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{client.id}</td>
                    <td className="px-5 py-3 text-sm text-foreground">{client.name}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{client.nit}</td>
                    <td className="px-5 py-3">
                      <Badge variant={client.type === "Mayorista" ? "secondary" : "outline"}>
                        {client.type}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{client.phone}</td>
                    <td className="px-5 py-3 text-sm text-foreground">{client.purchases}</td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      Q{client.balance.toLocaleString("en", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{client.lastPurchase}</td>
                    <td className="px-5 py-3">
                      <Badge variant={client.status === "Mora" ? "destructive" : client.status === "Con Credito" ? "secondary" : "outline"}>
                        {client.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(client)}
                          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(client.raw_id)}
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
            <DialogTitle>{editingClient ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input 
                  id="nombre" 
                  name="nombre" 
                  required 
                  defaultValue={editingClient?.name || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nit">NIT</Label>
                <Input 
                  id="nit" 
                  name="nit" 
                  defaultValue={editingClient?.nit !== "C/F" ? editingClient?.nit : ""}
                  placeholder="C/F si está vacío"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_cliente">Tipo de Cliente</Label>
                <Select name="tipo_cliente" defaultValue={editingClient?.type || "Minorista"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Minorista">Minorista</SelectItem>
                    <SelectItem value="Mayorista">Mayorista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input 
                  id="telefono" 
                  name="telefono" 
                  defaultValue={editingClient?.phone !== "--" ? editingClient?.phone : ""}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input 
                  id="direccion" 
                  name="direccion" 
                  defaultValue={editingClient?.address !== "--" ? editingClient?.address : ""}
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
