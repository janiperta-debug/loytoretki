"use client"

import { useState } from "react"
import Link from "next/link"
import { SlidersHorizontal, Navigation, ChevronRight } from "lucide-react"
import { LOCATIONS, SCORE_META, type Category, type Location } from "@/lib/loytoretki-data"
import { ScoreDot } from "@/components/app/compass-bits"

type Filter = "kaikki" | "kirpputori" | "kierratys" | "muut"

const FILTERS: { key: Filter; label: string }[] = [
  { key: "kaikki", label: "Kaikki" },
  { key: "kirpputori", label: "Kirpputorit" },
  { key: "kierratys", label: "Kierrätyskeskukset" },
  { key: "muut", label: "Muut" },
]

function matches(loc: Location, f: Filter) {
  if (f === "kaikki") return true
  if (f === "kirpputori") return loc.category === "kirpputori"
  if (f === "kierratys") return loc.category === "kierratys"
  return (["huutokauppa", "antiikki", "muu"] as Category[]).includes(loc.category)
}

const CITY_LABELS = [
  { name: "Hyvinkää", x: 47, y: 15 },
  { name: "Riihimäki", x: 78, y: 42 },
  { name: "Nurmijärvi", x: 26, y: 60 },
  { name: "Mäntsälä", x: 66, y: 74 },
]

export default function KarttaPage() {
  const [filter, setFilter] = useState<Filter>("kaikki")
  const [selectedId, setSelectedId] = useState<string>(LOCATIONS[0].id)

  const visible = LOCATIONS.filter((l) => matches(l, filter))
  const selected = LOCATIONS.find((l) => l.id === selectedId)
  const selectedVisible = selected && matches(selected, filter) ? selected : null

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between px-4 pb-3 pt-6">
        <span className="w-9" aria-hidden="true" />
        <h1 className="font-serif text-xl font-semibold uppercase tracking-[0.15em] text-foreground">
          Retkikartta
        </h1>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground"
          aria-label="Kartan suodattimet"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      <div className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f.key
                ? "border-forest bg-forest text-forest-foreground"
                : "border-border bg-card text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative mx-4 flex-1 overflow-hidden rounded-2xl border border-border shadow-inner">
        <img
          src="/images/app/paper-map.png"
          alt="Vanha karttakuva retkialueesta"
          className="h-full min-h-[26rem] w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-[oklch(0.9_0.03_80_/_0.12)]" />

        {CITY_LABELS.map((c) => (
          <span
            key={c.name}
            className="pointer-events-none absolute -translate-x-1/2 text-[11px] font-semibold uppercase tracking-widest text-ink/70"
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
          >
            {c.name}
          </span>
        ))}

        {/* current location */}
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: "50%", top: "48%" }}
          aria-label="Sijaintisi"
        >
          <span className="block h-4 w-4 rounded-full border-2 border-background bg-info shadow-md" />
          <span className="absolute inset-0 -z-10 m-auto h-8 w-8 animate-ping rounded-full bg-info/30" />
        </span>

        {visible.map((loc) => (
          <MapMarker
            key={loc.id}
            loc={loc}
            active={loc.id === selectedId}
            onSelect={() => setSelectedId(loc.id)}
          />
        ))}

        <button
          type="button"
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-forest shadow-md active:scale-95"
          aria-label="Keskitä sijaintiisi"
        >
          <Navigation className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="px-4 pt-3">
        {selectedVisible ? (
          <SelectedCard loc={selectedVisible} />
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-card p-4 text-center text-sm text-muted-foreground">
            Ei kohteita tällä suodattimella. Valitse toinen luokka.
          </p>
        )}
      </div>
    </div>
  )
}

function MapMarker({
  loc,
  active,
  onSelect,
}: {
  loc: Location
  active: boolean
  onSelect: () => void
}) {
  const token = SCORE_META[loc.score].token
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${loc.name}, ${SCORE_META[loc.score].label}`}
      className="marker-pop absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
      style={{ left: `${loc.map.x}%`, top: `${loc.map.y}%` }}
      aria-pressed={active}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 font-serif text-sm font-bold text-[oklch(0.98_0.02_88)] shadow-lg transition-transform ${
          active ? "scale-115 ring-2 ring-offset-2 ring-offset-transparent" : ""
        }`}
        style={{ backgroundColor: token, borderColor: "oklch(0.96 0.02 88 / 0.85)", boxShadow: "0 4px 10px oklch(0.2 0.02 60 / 0.4)" }}
      >
        {loc.markerNumber}
      </span>
      <span
        className="-mt-1 h-3 w-3 rotate-45 border-b-2 border-r-2"
        style={{ backgroundColor: token, borderColor: "oklch(0.96 0.02 88 / 0.85)" }}
        aria-hidden="true"
      />
    </button>
  )
}

function SelectedCard({ loc }: { loc: Location }) {
  return (
    <Link
      href={`/sovellus/kohde/${loc.id}`}
      className="block overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-colors active:bg-secondary"
    >
      <div className="flex gap-3 p-3">
        <img
          src={loc.image || "/placeholder.svg"}
          alt=""
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-serif text-lg font-semibold text-foreground">{loc.name}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loc.distanceKm.toLocaleString("fi-FI")} km · {loc.hours}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {loc.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[11px] font-medium text-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border bg-background/50 px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <ScoreDot score={loc.score} />
          Kompassin arvio: {SCORE_META[loc.score].label}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
    </Link>
  )
}
