"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { Settings, Building2, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function ConfiguracionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [config, setConfig] = useState({
    company: "Agropecuaria StockFlow",
    nit: "1234567-8",
    address: "Guatemala, Guatemala",
    phone: "5555-0000",
    serie: "A",
    nextInvoice: "FAC-0007",
    iva: "12",
    currency: "GTQ (Quetzales)"
  })

  // Load from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("agrodesk_settings")
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig))
      } catch (e) {
        console.error("Error parsing settings", e)
      }
    }
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Save to localStorage
    try {
      localStorage.setItem("agrodesk_settings", JSON.stringify(config))
      toast.success("Configuracion guardada exitosamente")
    } catch (e) {
      toast.error("Error al guardar la configuracion")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setConfig(prev => ({ ...prev, [id]: value }))
  }

  return (
    <AppShell>
      <PageHeader icon={Settings} title="Configuracion del Sistema" />

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Company Info */}
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
                value={config.company} 
                onChange={handleChange}
                className="mt-1" 
                required
              />
            </div>
            <div>
              <Label htmlFor="nit">NIT</Label>
              <Input 
                id="nit" 
                value={config.nit} 
                onChange={handleChange}
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="address">Direccion</Label>
              <Input 
                id="address" 
                value={config.address} 
                onChange={handleChange}
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefono</Label>
              <Input 
                id="phone" 
                value={config.phone} 
                onChange={handleChange}
                className="mt-1" 
              />
            </div>
          </div>
        </div>

        {/* Invoice settings */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">Configuracion de Facturas</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="serie">Serie de Factura</Label>
              <Input 
                id="serie" 
                value={config.serie} 
                onChange={handleChange}
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="nextInvoice">Siguiente No. Factura</Label>
              <Input 
                id="nextInvoice" 
                value={config.nextInvoice} 
                onChange={handleChange}
                className="mt-1" 
              />
            </div>
            <div>
              <Label htmlFor="iva">Porcentaje IVA (%)</Label>
              <Input 
                id="iva" 
                value={config.iva} 
                onChange={handleChange}
                type="number" 
                className="mt-1" 
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Moneda</Label>
              <Input 
                id="currency" 
                value={config.currency} 
                onChange={handleChange}
                className="mt-1" 
              />
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </AppShell>
  )
}
