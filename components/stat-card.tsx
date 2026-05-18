import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  subtitle?: string
  change?: string
}

export function StatCard({ title, value, icon: Icon, subtitle, change }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
      {/* Decorative subtle gradient blob */}
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-2xl font-black text-foreground tracking-tight relative z-10 break-all" title={value}>{value}</p>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground font-medium relative z-10">{subtitle}</p>}
      {change && <p className="mt-1 text-xs text-muted-foreground relative z-10">{change}</p>}
    </div>
  )
}
