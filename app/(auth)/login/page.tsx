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
    <div className="min-h-screen w-full bg-[#0a0f0d] flex items-center justify-center relative overflow-hidden">
      
      {/* Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[#3c5d42]/40 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#86ac86]/30 rounded-full blur-[100px]" />
      <div className="absolute top-[20%] right-[20%] w-[20vw] h-[20vw] bg-emerald-600/20 rounded-full blur-[80px]" />

      <div className="relative z-10 w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-5 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden m-6">
        
        {/* Left Side: Branding (Span 2) */}
        <div className="lg:col-span-2 relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-b from-primary/20 to-transparent border-r border-white/5">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#86ac86] to-[#3c5d42] shadow-lg mb-8">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">AgroDesk.</h1>
            <p className="text-emerald-400 font-medium mt-2">ERP & POS System</p>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white/90 leading-tight">
              Reinventando la gestión de tu agronegocio.
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-white/70 bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                <Sprout className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-medium">Inventario inteligente</span>
              </div>
              <div className="flex items-center gap-4 text-white/70 bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-medium">Análisis en tiempo real</span>
              </div>
              <div className="flex items-center gap-4 text-white/70 bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-medium">Seguridad de grado bancario</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form (Span 3) */}
        <div className="lg:col-span-3 flex items-center justify-center p-8 sm:p-16 bg-white/5">
          <div className="w-full max-w-sm">
            <div className="mb-10 flex items-center gap-3 lg:hidden justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#86ac86] to-[#3c5d42]">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">AgroDesk</h1>
            </div>

            <div className="space-y-2 text-center lg:text-left mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Iniciar Sesión
              </h2>
              <p className="text-sm text-white/60">
                Ingresa tus credenciales para acceder al panel.
              </p>
            </div>

            <LoginForm redirectTo={params.redirect ?? "/"} initialError={initialError} />
          </div>
        </div>

      </div>
    </div>
  )
}
