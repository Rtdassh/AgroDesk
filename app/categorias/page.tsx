"use client"

import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { FolderOpen, Package, Plus, Search, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const categories = [
  { id: 1, name: "Insecticidas", desc: "Productos para control de plagas", products: 45, status: "Activa" },
  { id: 2, name: "Herbicidas", desc: "Productos para control de malezas", products: 32, status: "Activa" },
  { id: 3, name: "Fungicidas", desc: "Productos para control de hongos", products: 28, status: "Activa" },
  { id: 4, name: "Fertilizantes", desc: "Nutrientes y abonos para cultivos", products: 56, status: "Activa" },
  { id: 5, name: "Semillas", desc: "Semillas certificadas", products: 18, status: "Activa" },
  { id: 6, name: "Herramientas", desc: "Herramientas agricolas", products: 14, status: "Activa" },
  { id: 7, name: "Equipos de Riego", desc: "Sistemas y accesorios de riego", products: 9, status: "Inactiva" },
]

export default function CategoriasPage() {
  return (
    <AppShell>
      <PageHeader icon={FolderOpen} title="Categorias de Productos" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Categorias" value={categories.length.toString()} icon={FolderOpen} subtitle="Categorias registradas" />
        <StatCard title="Categorias Activas" value={categories.filter(c => c.status === "Activa").length.toString()} icon={FolderOpen} subtitle="En uso actualmente" />
        <StatCard title="Total Productos" value={categories.reduce((s, c) => s + c.products, 0).toString()} icon={Package} subtitle="Distribuidos en categorias" />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Listado de Categorias</h2>
            <p className="text-sm text-muted-foreground">Clasifica tus productos por tipo</p>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Categoria
          </Button>
        </div>

        <div className="px-5 pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar categorias..." className="pl-9" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">No.</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Categoria</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Descripcion</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Productos</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                <th className="px-5 py-3 text-left text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t border-border">
                  <td className="px-5 py-3 text-sm text-foreground">{cat.id}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-foreground">{cat.name}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{cat.desc}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{cat.products}</td>
                  <td className="px-5 py-3">
                    <Badge variant={cat.status === "Inactiva" ? "secondary" : "outline"}>{cat.status}</Badge>
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
