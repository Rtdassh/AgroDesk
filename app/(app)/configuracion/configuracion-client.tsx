"use client"

import { useTransition } from "react"
import { Settings, Building2, Receipt } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveConfig, type CompanyConfig } from "@/app/actions/settings"

export function ConfiguracionClient({
  initialConfig,
}: {
  initialConfig: CompanyConfig
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await saveConfig(formData)
      if (result.success) {
        toast.success("Configuracion guardada")
        router.refresh()
      } else {
        toast.error(result.error || "Error al guardar")
      }
    })
  }

  return (
    <>
      <PageHeader icon={Settings} title="Configuracion del Sistema" />

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">Datos de la Empresa</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="company">Nombre de la Empresa</Label>
              <Input
                id="company"
                name="company"
                defaultValue={initialConfig.company}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="nit">NIT</Label>
              <Input
                id="nit"
                name="nit"
                defaultValue={initialConfig.nit ?? ""}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address">Direccion</Label>
              <Input
                id="address"
                name="address"
                defaultValue={initialConfig.address ?? ""}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={initialConfig.phone ?? ""}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">
              Configuracion de Facturas
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="serie">Serie de Factura</Label>
              <Input
                id="serie"
                name="serie"
                defaultValue={initialConfig.serie ?? ""}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="next_invoice">Siguiente No. Factura</Label>
              <Input
                id="next_invoice"
                name="next_invoice"
                defaultValue={initialConfig.next_invoice ?? ""}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="iva">Porcentaje IVA (%)</Label>
              <Input
                id="iva"
                name="iva"
                type="number"
                step="0.01"
                defaultValue={initialConfig.iva.toString()}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Moneda</Label>
              <Input
                id="currency"
                name="currency"
                defaultValue={initialConfig.currency}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end lg:col-span-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </>
  )
}
