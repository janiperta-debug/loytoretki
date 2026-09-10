"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Cookie, X } from "lucide-react"

const DISMISSED_KEY = "loytoretki-cookie-notice-dismissed"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(DISMISSED_KEY) !== "1")
    } catch {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1")
    } catch {
      // The notice can still be dismissed for the current render.
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <aside
      aria-label="Eväste- ja tallennustilailmoitus"
      className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-md rounded-2xl border border-border bg-card/95 p-4 shadow-xl shadow-black/20 backdrop-blur-md"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary">
          <Cookie className="h-4 w-4 text-brass" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-serif text-base font-semibold text-foreground">Evästeet ja tallennustila</h2>
            <button type="button" onClick={dismiss} aria-label="Sulje ilmoitus" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Löytöretki käyttää välttämättömiä selaimen tallennusmenetelmiä esimerkiksi kirjautumisen ja tämän ilmoituksen muistamisen toimintaan. Emme käytä tällä hetkellä markkinointi- tai analytiikkaseurantaa.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button type="button" onClick={dismiss} className="rounded-lg bg-forest px-3.5 py-2 text-xs font-semibold text-forest-foreground">
              Selvä
            </button>
            <Link href="/sovellus/legal" className="text-xs font-medium text-forest underline underline-offset-2">
              Lue lisää
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
