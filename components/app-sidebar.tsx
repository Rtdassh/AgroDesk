"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"
import { cn } from "@/lib/utils"

const navSections = [
  {
    label: "Navegacion Principal",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Ventas", href: "/ventas", icon: ShoppingCart },
      { name: "Inventario", href: "/inventario", icon: Package },
      { name: "Proveedores", href: "/proveedores", icon: Truck },
      { name: "Clientes", href: "/clientes", icon: UserCheck },
    ],
  },
  {
    label: "Gestion",
    items: [
      { name: "Movimientos", href: "/movimientos", icon: TrendingUp },
      { name: "Reportes", href: "/reportes", icon: BarChart3 },
      { name: "Finanzas", href: "/finanzas", icon: DollarSign },
    ],
  },
  {
    label: "Sistema",
    items: [
      { name: "Usuarios", href: "/usuarios", icon: Users },
      { name: "Configuracion", href: "/configuracion", icon: Settings },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 px-6 py-5">
        <Leaf className="h-6 w-6 text-green-500" />
        <div>
          <h1 className="text-lg font-bold leading-none text-foreground">AgroDesk</h1>
          <span className="text-xs text-muted-foreground">v1.0.0</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
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

      <div className="border-t border-border px-6 py-4">
        <p className="text-xs text-muted-foreground">Sistema de Inventario</p>
        <p className="text-xs text-muted-foreground">Version de Escritorio</p>
        <p className="mt-1 text-xs text-muted-foreground">&copy; SysMize</p>
      </div>
    </aside>
  )
}
