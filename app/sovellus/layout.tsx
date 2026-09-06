import type { ReactNode } from "react"
import { BottomNav } from "@/components/app/bottom-nav"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-secondary/40 lg:py-6">
      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col bg-background shadow-xl shadow-black/10 lg:min-h-0 lg:rounded-3xl lg:ring-1 lg:ring-border">
        <main className="flex-1 pb-28">{children}</main>
        <BottomNav />
      </div>
    </div>
  )
}
