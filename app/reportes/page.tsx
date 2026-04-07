"use client"

import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { BarChart3, Wrench } from "lucide-react"

export default function ReportesPage() {
  return (
    <AppShell>
      <PageHeader icon={BarChart3} title="Reportes y Análisis BI" />

      <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center">
        <div className="mb-4 rounded-full bg-accent p-4">
          <Wrench className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Módulo en Construcción</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          El módulo de reportes avanzados y Business Intelligence se encuentra actualmente en desarrollo. Pronto podrás generar reportes detallados de ventas, inventario y rendimiento.
        </p>
      </div>
    </AppShell>
  )
}
