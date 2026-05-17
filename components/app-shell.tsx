"use client"

import { AppSidebar, MobileSidebar } from "@/components/app-sidebar"
import type { UserProfile } from "@/lib/auth"

export function AppShell({
  children,
  profile,
}: {
  children: React.ReactNode
  profile: UserProfile
}) {
  return (
    <div className="flex h-screen flex-col bg-[#f0f4f1] dark:bg-[#0a0f0d] md:flex-row relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-600/10 dark:bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none" />

      <AppSidebar profile={profile} />
      
      <div className="flex flex-1 flex-col overflow-hidden z-10 m-2 md:m-4 md:ml-0 bg-white/80 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl md:rounded-[2.5rem] shadow-2xl shadow-primary/5">
        <MobileSidebar profile={profile} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
