"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Users, ShieldCheck, UserX, Plus, Search, Pencil, KeyRound } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { DataTable, type Column } from "@/components/data-table"
import { RowActions } from "@/components/row-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createUser, deleteUser, resetUserPassword, setUserActive, updateUser, type AppUser } from "@/app/actions/users"

type Role = { id_rol: number; nombre: string }

export function UsuariosClient({ initialUsers, roles }: { initialUsers: AppUser[]; roles: Role[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [isPending, startTransition] = useTransition()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<AppUser | null>(null)
  const [editActivo, setEditActivo] = useState(true)

  const [isPwdOpen, setIsPwdOpen] = useState(false)
  const [pwdTarget, setPwdTarget] = useState<AppUser | null>(null)
  const [newPassword, setNewPassword] = useState("")

  const filtered = initialUsers.filter((u) => {
    const q = search.toLowerCase()
    return u.nombre.toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q) || (u.rol ?? "").toLowerCase().includes(q)
  })

  const total = initialUsers.length
  const activos = initialUsers.filter((u) => u.activo).length
  const inactivos = total - activos

  const handleOpenCreate = () => { setEditing(null); setEditActivo(true); setIsModalOpen(true) }
  const handleOpenEdit = (user: AppUser) => { setEditing(user); setEditActivo(user.activo); setIsModalOpen(true) }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = editing ? await updateUser(editing.id_usuario, formData) : await createUser(formData)
      if (result.success) { toast.success(editing ? "Usuario actualizado" : "Usuario creado"); setIsModalOpen(false); router.refresh() }
      else toast.error(result.error || "Error al guardar")
    })
  }

  const handleToggleActive = (user: AppUser) => {
    startTransition(async () => {
      const result = await setUserActive(user.id_usuario, !user.activo)
      if (result.success) { toast.success(`Usuario ${!user.activo ? "activado" : "desactivado"}`); router.refresh() }
      else toast.error(result.error || "Error")
    })
  }

  const handleDelete = async (user: AppUser) => {
    startTransition(async () => {
      const result = await deleteUser(user.id_usuario)
      if (result.success) { toast.success("Usuario eliminado"); router.refresh() }
      else toast.error(result.error || "Error al eliminar")
    })
  }

  const handleResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!pwdTarget) return
    startTransition(async () => {
      const result = await resetUserPassword(pwdTarget.id_usuario, newPassword)
      if (result.success) { toast.success("Contrasena actualizada"); setIsPwdOpen(false); setPwdTarget(null); setNewPassword("") }
      else toast.error(result.error || "Error")
    })
  }

  const columns: Column<AppUser>[] = [
    { key: "nombre", header: "Nombre", render: (r) => <span className="font-semibold">{r.nombre}</span> },
    { key: "email", header: "Email", render: (r) => <span className="text-muted-foreground">{r.email ?? "--"}</span> },
    { key: "rol", header: "Rol", render: (r) => <Badge variant={r.rol === "Administrador" ? "default" : "outline"}>{r.rol ?? "Sin rol"}</Badge> },
    { key: "last_sign_in", header: "Ultimo acceso", render: (r) => <span className="text-muted-foreground">{r.last_sign_in ? new Date(r.last_sign_in).toLocaleString() : "Nunca"}</span> },
    { key: "activo", header: "Estado", render: (r) => (
      <div className="flex items-center gap-2">
        <Switch checked={r.activo} onCheckedChange={() => handleToggleActive(r)} disabled={isPending} />
        <span className="text-xs text-muted-foreground">{r.activo ? "Activo" : "Inactivo"}</span>
      </div>
    )},
    { key: "actions", header: "", render: (r) => (
      <RowActions
        actions={[
          { label: "Editar", icon: Pencil, onClick: () => handleOpenEdit(r) },
          { label: "Cambiar contrasena", icon: KeyRound, onClick: () => { setPwdTarget(r); setNewPassword(""); setIsPwdOpen(true) } },
        ]}
        deleteConfig={{ title: "Eliminar usuario", description: `Eliminar definitivamente a "${r.nombre}". Esta accion no se puede deshacer.`, onConfirm: () => handleDelete(r) }}
      />
    )},
  ]

  return (
    <>
      <PageHeader icon={Users} title="Gestion de Usuarios" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Usuarios" value={total.toString()} icon={Users} subtitle="Registrados en el sistema" />
        <StatCard title="Usuarios Activos" value={activos.toString()} icon={ShieldCheck} subtitle="Con acceso al sistema" />
        <StatCard title="Usuarios Inactivos" value={inactivos.toString()} icon={UserX} subtitle="Sin acceso actualmente" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>Gestiona roles y permisos de acceso</CardDescription>
          <CardAction>
            <Button size="sm" onClick={handleOpenCreate}><Plus className="mr-2 h-4 w-4" />Nuevo Usuario</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar usuarios..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <DataTable columns={columns} data={filtered} rowKey={(r) => r.id_usuario} emptyIcon={Users} emptyMessage="No se encontraron usuarios." />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input id="nombre" name="nombre" required defaultValue={editing?.nombre ?? ""} />
            </div>
            {!editing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electronico</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contrasena (min. 8 caracteres)</Label>
                  <Input id="password" name="password" type="password" minLength={8} required />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="id_rol">Rol</Label>
              <Select name="id_rol" defaultValue={(editing?.id_rol ?? roles[0]?.id_rol ?? "").toString()} required>
                <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => <SelectItem key={r.id_rol} value={r.id_rol.toString()}>{r.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {editing && (
              <div className="flex items-center gap-2">
                <Switch id="activo" checked={editActivo} onCheckedChange={setEditActivo} />
                <Label htmlFor="activo">Cuenta activa</Label>
                <input type="hidden" name="activo" value={editActivo ? "true" : "false"} />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : "Guardar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPwdOpen} onOpenChange={setIsPwdOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cambiar contrasena de {pwdTarget?.nombre}</DialogTitle></DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contrasena</Label>
              <Input id="newPassword" type="password" minLength={8} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPwdOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : "Actualizar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
