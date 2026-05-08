"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"

const icons = { light: Sun, dark: Moon, system: Monitor } as const
const nextTheme = { light: "dark", dark: "system", system: "light" } as const

export function ThemeToggle() {
  const { theme = "system", resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label="Cambiar tema"
        suppressHydrationWarning
      />
    )
  }

  const effectiveTheme = resolvedTheme ?? theme
  const key = (effectiveTheme in icons ? effectiveTheme : "system") as keyof typeof icons
  const Icon = icons[key]

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => setTheme(nextTheme[key])}
      title={`Tema: ${key}`}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
