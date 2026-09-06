"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, X, MapPin, SlidersHorizontal, Bell, ChevronRight } from "lucide-react"
import { LOCATIONS, SCORE_META, type CompassScore } from "@/lib/loytoretki-data"
import { ScoreDot } from "@/components/app/compass-bits"

const LEGEND: CompassScore[] = ["high", "mid", "low"]

export default function HakuPage() {
  const [query, setQuery] = useState("Luistimet")

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = [...LOCATIONS].sort((a, b) => a.distanceKm - b.distanceKm)
    if (!q) return base
    return base.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.town.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q)) ||
        l.hitLine.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="min-h-full">
      <header className="border-b border-border/70 bg-card/80 px-5 pb-4 pt-6 backdrop-blur">
        <h1 className="text-center font-serif text-lg font-semibold uppercase tracking-[0.12em] text-foreground">
          Etsi tiettyä tuotetta
        </h1>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-3 shadow-sm">
          <Search className="h-5 w-5 shrink-0 text-brass" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mitä etsit?"
            aria-label="Hakusana"
            className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <span className="shrink-0 rounded-md bg-secondary px-2 py-0.5 text-sm font-semibold text-secondary-foreground tabular-nums">
            {results.length}
          </span>
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Tyhjennä haku"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterChip icon={<MapPin className="h-3.5 w-3.5" />} label="Sijainti: 20 km" />
          <FilterChip label="Kaikki kategoriat" />
          <FilterChip icon={<SlidersHorizontal className="h-3.5 w-3.5" />} label="Suodattimet" />
        </div>
      </header>

      <div className="px-5 py-5">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="font-serif text-base font-semibold text-foreground">Kompassin arvioasteikko</h2>
          <ul className="mt-3 space-y-2.5">
            {LEGEND.map((s) => (
              <li key={s} className="flex items-start gap-2.5">
                <ScoreDot score={s} className="mt-1.5" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: SCORE_META[s].token }}>
                    {SCORE_META[s].label}
                  </p>
                  <p className="text-sm leading-snug text-muted-foreground">{SCORE_META[s].blurb}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <ul className="mt-5 space-y-3">
          {results.map((l) => (
            <li key={l.id}>
              <Link
                href={`/sovellus/kohde/${l.id}`}
                className="group flex items-stretch gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition-transform active:scale-[0.99]"
              >
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg">
                  <Image src={l.image || "/placeholder.svg"} alt="" fill className="object-cover" sizes="80px" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]"
                      style={{
                        backgroundColor: `color-mix(in oklch, ${SCORE_META[l.score].token} 18%, transparent)`,
                        color: SCORE_META[l.score].token,
                      }}
                    >
                      {SCORE_META[l.score].label}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                      {l.distanceKm.toLocaleString("fi-FI")} km
                    </span>
                  </div>
                  <h3 className="mt-1 truncate font-serif text-base font-semibold text-foreground">{l.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Viimeisin tieto: {l.lastSeen}</p>
                  <p className="mt-auto pt-1 text-sm text-foreground">{l.hitLine}</p>
                </div>
                <ChevronRight className="my-auto h-5 w-5 shrink-0 self-center text-muted-foreground transition-transform group-active:translate-x-0.5" />
              </Link>
            </li>
          ))}
          {results.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
              Ei osumia haulle {'"'}
              {query}
              {'"'}. Kompassi ehdottaa laajentamaan sädettä.
            </li>
          )}
        </ul>

        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground shadow-sm transition-transform active:scale-[0.99]">
          <Bell className="h-4 w-4 text-brass" aria-hidden />
          Tallenna haku
        </button>
      </div>
    </div>
  )
}

function FilterChip({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <button className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground shadow-sm transition-transform active:scale-95">
      {icon && <span className="text-brass">{icon}</span>}
      {label}
    </button>
  )
}
