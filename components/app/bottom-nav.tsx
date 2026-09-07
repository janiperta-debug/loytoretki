"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Map, NotebookPen, User } from "lucide-react"
import { CompassMark } from "@/components/compass-mark"

const items = [
  { href: "/sovellus", label: "Koti", icon: Home, exact: true },
  { href: "/sovellus/kartta", label: "Kartta", icon: Map },
  { href: "/sovellus/paivakirja", label: "Päiväkirja", icon: NotebookPen },
  { href: "/sovellus/profiili", label: "Profiili", icon: User },
] as const

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(href + "/")
}

export function BottomNav() {
  const pathname = usePathname()
  const left = items.slice(0, 2)
  const right = items.slice(2)

  return (
    <nav
      aria-label="Päänavigaatio"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md"
    >
      <div className="relative border-t border-border bg-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch justify-between px-2">
          {left.map((it) => (
            <NavButton key={it.href} {...it} active={isActive(pathname, it.href, it.exact)} />
          ))}

          <div className="w-16 shrink-0" aria-hidden="true" />

          {right.map((it) => (
            <NavButton key={it.href} {...it} active={isActive(pathname, it.href)} />
          ))}
        </div>

        {/* Center compass — shortcut to the core find experience */}
        <Link
          href="/sovellus/haku"
          aria-label="Lähde löytöretkelle"
          className="absolute -top-6 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-card bg-forest text-forest-foreground shadow-lg shadow-black/25 transition-transform active:scale-95"
        >
          <CompassMark className="h-9 w-9 text-brass" aria-hidden />
        </Link>
      </div>
    </nav>
  )
}

function NavButton({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: typeof Home
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors ${
        active ? "text-forest" : "text-muted-foreground"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
      {label}
    </Link>
  )
}
