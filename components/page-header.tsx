import type { LucideIcon } from "lucide-react"

interface PageHeaderProps {
  icon: LucideIcon
  title: string
}

export function PageHeader({ icon: Icon, title }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#86ac86] to-[#3c5d42] shadow-lg shadow-primary/20">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">{title}</h1>
        <div className="h-1 w-12 rounded-full bg-primary mt-1 opacity-80" />
      </div>
    </div>
  )
}
