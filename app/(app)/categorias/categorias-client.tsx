"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { DataTable, type Column } from "@/components/data-table"
import { RowActions } from "@/components/row-actions"
import { Tags, Search, Plus, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { addCategory, updateCategory, deleteCategory } from "@/app/actions/categories"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function CategoriasClient({ initialCategories }: { initialCategories: any[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = initialCategories

  const filteredCategories = categories.filter((c: any) =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.descripcion && c.descripcion.toLowerCase().includes(search.toLowerCase()))
  )

  const handleOpenCreate = () => { setEditingCategory(null); setIsModalOpen(true) }
  const handleOpenEdit = (category: any) => { setEditingCategory(category); setIsModalOpen(true) }

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteCategory(id)
      if (result.success) { 
        toast.success("Categoría eliminada")
        router.refresh() 
      } else { 
        if (result.error?.includes("foreign key constraint")) {
          toast.error("No se puede eliminar la categoría porque tiene productos asociados.")
        } else {
          toast.error(result.error || "Error al eliminar")
        }
      }
    } catch { toast.error("Error inesperado") }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      const result = editingCategory
        ? await updateCategory(editingCategory.id_categoria, formData)
        : await addCategory(formData)
      
      if (result.success) {
        toast.success(`Categoría ${editingCategory ? "actualizada" : "creada"} exitosamente`)
        setIsModalOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Error al guardar")
      }
    } catch { toast.error("Error inesperado") }
    finally { setIsSubmitting(false) }
  }

  const columns: Column<any>[] = [
    { key: "id", header: "ID", render: (r) => r.id_categoria },
    { key: "nombre", header: "Nombre", render: (r) => <span className="font-semibold">{r.nombre}</span> },
    { key: "descripcion", header: "Descripción", render: (r) => <span className="text-muted-foreground">{r.descripcion || "--"}</span> },
    { key: "actions", header: "", render: (r) => (
      <RowActions
        actions={[{ label: "Editar", icon: Pencil, onClick: () => handleOpenEdit(r) }]}
        deleteConfig={{ 
          title: "Eliminar categoría", 
          description: "¿Estás seguro? No se podrá eliminar si hay productos asociados a ella.", 
          onConfirm: () => handleDelete(r.id_categoria) 
        }}
      />
    )},
  ]

  return (
    <>
      <PageHeader icon={Tags} title="Gestión de Categorías" />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Categorías de Productos</CardTitle>
          <CardDescription>Administra las agrupaciones de tu inventario</CardDescription>
          <CardAction>
            <Button size="sm" onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar categorías..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <DataTable columns={columns} data={filteredCategories} rowKey={(r) => r.id_categoria} emptyIcon={Tags} emptyMessage="No se encontraron categorías." />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Categoría</Label>
              <Input id="nombre" name="nombre" required defaultValue={editingCategory?.nombre || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción (Opcional)</Label>
              <Input id="descripcion" name="descripcion" defaultValue={editingCategory?.descripcion || ""} />
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
