"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useTransition } from "react"
import {
  LayoutDashboard,
  Package,
  Truck,
  TrendingUp,
  BarChart3,
  Users,
  Settings,
  ShoppingCart,
  UserCheck,
  DollarSign,
  Leaf,
  LogOut,
  Menu,
  Tags,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { signOut } from "@/app/(auth)/login/actions"
import type { UserProfile } from "@/lib/auth"

type NavItem = {
  name: string
  href: string
  icon: typeof LayoutDashboard
  adminOnly?: boolean
}

type NavSection = {
  label: string
  adminOnly?: boolean
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    label: "Navegacion Principal",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Ventas", href: "/ventas", icon: ShoppingCart },
      { name: "Compras", href: "/compras", icon: Truck },
      { name: "Inventario", href: "/inventario", icon: Package },
      { name: "Categorías", href: "/categorias", icon: Tags },
      { name: "Proveedores", href: "/proveedores", icon: Truck },
      { name: "Clientes", href: "/clientes", icon: UserCheck },
    ],
  },
  {
    label: "Gestion",
    items: [
      { name: "Movimientos", href: "/movimientos", icon: TrendingUp },
      { name: "Reportes", href: "/reportes", icon: BarChart3, adminOnly: true },
      { name: "Finanzas", href: "/finanzas", icon: DollarSign },
    ],
  },
  {
    label: "Sistema",
    adminOnly: true,
    items: [
      { name: "Usuarios", href: "/usuarios", icon: Users, adminOnly: true },
      { name: "Configuracion", href: "/configuracion", icon: Settings, adminOnly: true },
    ],
  },
]

function SidebarContent({
  profile,
  onNavigate,
}: {
  profile: UserProfile
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const isAdmin = profile.rol === "Administrador"

  const visibleSections = navSections
    .filter((section) => !section.adminOnly || isAdmin)
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.adminOnly || isAdmin),
    }))
    .filter((section) => section.items.length > 0)

  const initials = profile.nombre
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <>
      <div className="flex items-center gap-2 px-6 py-5">
        <Leaf className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-lg font-bold leading-none text-foreground">AgroDesk</h1>
          <span className="text-xs text-muted-foreground">v1.0.0</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {visibleSections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {initials || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {profile.nombre}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {profile.email ?? ""}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <Badge variant={isAdmin ? "default" : "outline"} className="text-[10px]">
            {profile.rol ?? "Sin rol"}
          </Badge>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => startTransition(() => signOut())}
              disabled={pending}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
              title="Cerrar sesion"
            >
              <LogOut className="h-3.5 w-3.5" />
              {pending ? "Saliendo..." : "Salir"}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export function AppSidebar({ profile }: { profile: UserProfile }) {
  return (
    <aside className="hidden md:flex h-screen w-[280px] flex-col border-none bg-transparent z-20">
      <SidebarContent profile={profile} />
    </aside>
  )
}

export function MobileSidebar({ profile }: { profile: UserProfile }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Abrir menu">
          <Menu className="h-5 w-5" />
        </Button>
        <Leaf className="h-5 w-5 text-primary" />
        <span className="text-sm font-bold text-foreground">AgroDesk</span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <SheetTitle className="sr-only">Menu de navegacion</SheetTitle>
          <SidebarContent profile={profile} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
