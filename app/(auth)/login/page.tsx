import { Leaf, Sprout, BarChart3, ShieldCheck } from "lucide-react"
import { LoginForm } from "./login-form"

export const metadata = {
  title: "Iniciar sesion · AgroDesk",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>
}) {
  const params = await searchParams
  const initialError =
    params.error === "disabled"
      ? "Tu cuenta esta desactivada. Contacta al administrador."
      : undefined

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Hero panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#1b1f14] p-10 text-white lg:flex">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "linear-gradient(135deg, #1b1f14 0%, #283e2c 50%, #3c5d42 100%)",
          }}
        />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#86ac86]/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-[#507c58]/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
            <Leaf className="h-6 w-6 text-[#86ac86]" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none">AgroDesk</h1>
            <p className="text-xs text-white/70">v1.0.0</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold leading-tight">
            Gestiona tu agronegocio con precision
          </h2>
          <p className="mt-4 text-base text-white/80">
            Inventario, ventas, finanzas y analisis de negocios en un solo lugar.
            Pensado para Agroservicios Tejutla.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-white/90">
            <li className="flex items-center gap-3">
              <Sprout className="h-4 w-4 text-[#86ac86]" />
              Control de lotes y vencimientos en tiempo real
            </li>
            <li className="flex items-center gap-3">
              <BarChart3 className="h-4 w-4 text-[#86ac86]" />
              Reportes y analitica de negocio para administradores
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-[#86ac86]" />
              Acceso seguro con roles diferenciados
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-xs text-white/60">
          &copy; {new Date().getFullYear()} SysMize · Todos los derechos reservados
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Leaf className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">AgroDesk</h1>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Bienvenido de vuelta
            </h2>
            <p className="text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </div>

          <LoginForm
            redirectTo={params.redirect ?? "/"}
            initialError={initialError}
          />
        </div>
      </div>
    </div>
  )
}
