"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[AppError]", error)
  }, [error])

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Alert variant="destructive" className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Ocurrio un error</AlertTitle>
        <AlertDescription className="mt-1">
          {error.message || "Error inesperado al cargar la pagina."}
          <Button variant="outline" size="sm" className="mt-3 w-full" onClick={reset}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
