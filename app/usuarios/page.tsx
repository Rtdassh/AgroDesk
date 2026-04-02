"use client"

import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Users, ShieldCheck, UserX, Plus, Search, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const users = [
  { id: 1, name: "Administrador", email: "admin@stockflow.gt", role: "Administrador", lastLogin: "2026-02-23 08:30", status: "Activo" },
  { id: 2, name: "Pablo Lorenzo", email: "pablo@stockflow.gt", role: "Vendedor", lastLogin: "2026-02-23 09:15", status: "Activo" },
  { id: 3, name: "Victor Chan", email: "victor@stockflow.gt", role: "Inventario", lastLogin: "2026-02-22 14:00", status: "Activo" },
  { id: 4, name: "Josue Calderon", email: "josue@stockflow.gt", role: "Vendedor", lastLogin: "2026-02-21 10:45", status: "Activo" },
  { id: 5, name: "Maria Fernandez", email: "maria@stockflow.gt", role: "Cajero", lastLogin: "2026-02-20 16:30", status: "Inactivo" },
]

export default function UsuariosPage() {
  return (
    <AppShell>
      <PageHeader icon={Users} title="Gestion de Usuarios" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Usuarios" value={users.length.toString()} icon={Users} subtitle="Registrados en el sistema" />
        <StatCard title="Usuarios Activos" value={users.filter(u => u.status === "Activo").length.toString()} icon={ShieldCheck} subtitle="Con acceso al sistema" />
        <StatCard title="Usuarios Inactivos" value={users.filter(u => u.status === "Inactivo").length.toString()} icon={UserX} subtitle="Sin acceso actualmente" />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Usuarios del Sistema</h2>
            <p className="text-sm text-muted-foreground">Gestiona roles y permisos de acceso</p>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        <div className="px-5 pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar usuarios..." className="pl-9" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Nombre</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Rol</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Ultimo Acceso</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-border">
                  <td className="px-5 py-3 text-sm text-foreground">{user.id}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-foreground">{user.name}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-5 py-3">
                    <Badge variant="outline">{user.role}</Badge>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{user.lastLogin}</td>
                  <td className="px-5 py-3">
                    <Badge variant={user.status === "Inactivo" ? "secondary" : "outline"}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                      <button className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
