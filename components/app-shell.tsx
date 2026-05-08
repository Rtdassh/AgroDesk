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
    <div className="flex h-screen flex-col bg-background md:flex-row">
      <AppSidebar profile={profile} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileSidebar profile={profile} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
