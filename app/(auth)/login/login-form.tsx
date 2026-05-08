"use client"

import { useActionState, useState } from "react"
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, type LoginState } from "./actions"

const initialState: LoginState = {}

export function LoginForm({
  redirectTo,
  initialError,
}: {
  redirectTo: string
  initialError?: string
}) {
  const [state, formAction, pending] = useActionState(login, {
    error: initialError,
  } as LoginState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="redirect" value={redirectTo} />

      <div className="space-y-2">
        <Label htmlFor="email">Correo electronico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="usuario@empresa.com"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Contrasena</Label>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="********"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
            tabIndex={0}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {state.error && (
        <div role="alert" aria-live="assertive" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Ingresando...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Ingresar
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Si no tienes credenciales, solicitalas al administrador del sistema.
      </p>
    </form>
  )
}
