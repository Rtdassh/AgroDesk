"use client"

import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { Settings, Building2, Receipt, Bell, Database, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export default function ConfiguracionPage() {
  return (
    <AppShell>
      <PageHeader icon={Settings} title="Configuracion del Sistema" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Company Info */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">Datos de la Empresa</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="company">Nombre de la Empresa</Label>
              <Input id="company" defaultValue="Agropecuaria StockFlow" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="nit">NIT</Label>
              <Input id="nit" defaultValue="1234567-8" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="address">Direccion</Label>
              <Input id="address" defaultValue="Guatemala, Guatemala" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Telefono</Label>
              <Input id="phone" defaultValue="5555-0000" className="mt-1" />
            </div>
            <Button size="sm">Guardar Cambios</Button>
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
              <Input id="serie" defaultValue="A" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="nextInvoice">Siguiente No. Factura</Label>
              <Input id="nextInvoice" defaultValue="FAC-0007" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="iva">Porcentaje IVA (%)</Label>
              <Input id="iva" defaultValue="12" type="number" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="currency">Moneda</Label>
              <Input id="currency" defaultValue="GTQ (Quetzales)" className="mt-1" />
            </div>
            <Button size="sm">Guardar Cambios</Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">Notificaciones y Alertas</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Alerta de Stock Minimo</p>
                <p className="text-xs text-muted-foreground">Notificar cuando un producto llegue al stock minimo</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Alerta de Vencimiento</p>
                <p className="text-xs text-muted-foreground">Notificar productos proximos a vencer</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Alerta de Deuda Vencida</p>
                <p className="text-xs text-muted-foreground">Notificar cuentas por cobrar vencidas</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Recordatorio Cierre de Caja</p>
                <p className="text-xs text-muted-foreground">Recordar realizar el cierre de caja diario</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* System */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">Base de Datos y Respaldo</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Respaldo Automatico</p>
                <p className="text-xs text-muted-foreground">Crear respaldo diario de la base de datos</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-foreground">Ultimo Respaldo</p>
              <p className="text-xs text-muted-foreground">2026-02-23 02:00 AM - Completado exitosamente</p>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Crear Respaldo Manual</Button>
              <Button variant="outline" size="sm">Restaurar Respaldo</Button>
            </div>
          </div>

          <Separator className="my-5" />

          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">Seguridad</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Autenticacion de dos factores</p>
                <p className="text-xs text-muted-foreground">Requerir codigo adicional al iniciar sesion</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Registro de Actividades</p>
                <p className="text-xs text-muted-foreground">Registrar todas las acciones de los usuarios</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
