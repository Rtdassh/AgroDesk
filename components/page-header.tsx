import type { LucideIcon } from "lucide-react"

interface PageHeaderProps {
  icon: LucideIcon
  title: string
}

export function PageHeader({ icon: Icon, title }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-6 w-1 rounded-full bg-primary" />
      <Icon className="h-5 w-5 text-foreground" />
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
    </div>
  )
}
