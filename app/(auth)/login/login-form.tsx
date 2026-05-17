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
        <Label htmlFor="email" className="text-white/80">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="usuario@empresa.com"
          className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500 h-12 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-white/80">Contraseña</Label>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500 h-12 rounded-xl pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-white/40 hover:text-white transition-colors"
            aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
            tabIndex={0}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {state.error && (
        <div role="alert" aria-live="assertive" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      )}

      <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 font-bold transition-all active:scale-[0.98]" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Verificando...
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-5 w-5" />
            Ingresar al Sistema
          </>
        )}
      </Button>

      <p className="text-center text-xs text-white/40 pt-4">
        Si no tienes credenciales, solicítalas al administrador del sistema.
      </p>
    </form>
  )
}
