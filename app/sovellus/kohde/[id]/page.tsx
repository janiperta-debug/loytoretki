"use client"

import { use, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ChevronLeft, Share2, Heart, MapPin, Clock, Navigation, ChevronRight } from "lucide-react"
import { getLocation, SCORE_META } from "@/lib/loytoretki-data"
import { ScoreDot, ObservedIcon, CompassGauge } from "@/components/app/compass-bits"

const TABS = ["Yleiskatsaus", "Ilmoitukset", "Pöydät", "Arviot"] as const

export default function KohdePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const location = getLocation(id)
  const [tab, setTab] = useState<(typeof TABS)[number]>("Yleiskatsaus")
  const [saved, setSaved] = useState(false)

  if (!location) notFound()

  const meta = SCORE_META[location.score]

  return (
    <div className="min-h-full">
      {/* atmospheric top image */}
      <div className="relative h-60 w-full">
        <Image src={location.image || "/placeholder.svg"} alt={location.name} fill className="object-cover" sizes="480px" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-background" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-6">
          <Link
            href="/sovellus/haku"
            aria-label="Takaisin"
            className="grid h-10 w-10 place-items-center rounded-full bg-background/85 text-foreground shadow-md backdrop-blur transition-transform active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex gap-2">
            <button
              aria-label="Jaa"
              className="grid h-10 w-10 place-items-center rounded-full bg-background/85 text-foreground shadow-md backdrop-blur transition-transform active:scale-95"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSaved((s) => !s)}
              aria-label={saved ? "Poista tallennus" : "Tallenna kohde"}
              aria-pressed={saved}
              className="grid h-10 w-10 place-items-center rounded-full bg-background/85 shadow-md backdrop-blur transition-transform active:scale-95"
            >
              <Heart className={`h-5 w-5 ${saved ? "fill-clay text-clay" : "text-foreground"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* header card overlapping the image */}
      <div className="relative -mt-10 px-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-serif text-2xl font-semibold text-foreground text-balance">{location.name}</h1>
            <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brass/40 text-brass">
              <Navigation className="h-5 w-5" strokeWidth={1.6} />
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brass" aria-hidden />
              {location.distanceKm.toLocaleString("fi-FI")} km
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-brass" aria-hidden />
              {location.hours}
            </span>
          </div>
          <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: meta.token }}>
            <ScoreDot score={location.score} />
            {meta.label}
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="mt-4 px-4">
        <div
          role="tablist"
          aria-label="Kohteen tiedot"
          className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-secondary/60 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-5">
        {tab === "Yleiskatsaus" ? (
          <Overview location={location} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
            <p className="font-serif text-base text-foreground">{tab}</p>
            <p className="mt-1 text-sm text-muted-foreground">Tämä osio täydentyy myöhemmin oikealla tiedolla.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Overview({ location }: { location: NonNullable<ReturnType<typeof getLocation>> }) {
  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg font-semibold text-foreground">Tänään alueella havaittu</h2>
          <span className="text-xs text-muted-foreground">Päivitetty {location.lastSeen.replace("tänään ", "")}</span>
        </div>
        <ul className="mt-3 grid grid-cols-5 gap-2">
          {location.observed.map((o) => (
            <li
              key={o.label}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card px-1 py-3 text-center shadow-sm"
            >
              <ObservedIcon icon={o.icon} className="h-6 w-6 text-brass" />
              <span className="font-serif text-lg font-semibold leading-none text-foreground tabular-nums">{o.count}</span>
              <span className="text-[10px] leading-tight text-muted-foreground">{o.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-foreground">Kompassin arvio tälle kohteelle</h2>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em]" style={{ color: SCORE_META[location.score].token }}>
          Todennäköisyys löytää etsimäsi: {location.likelihood}
        </p>
        <div className="mt-3 flex items-center gap-4">
          <div className="w-32 shrink-0">
            <CompassGauge score={location.score} />
          </div>
          <p className="text-sm leading-snug text-muted-foreground">{location.summary}</p>
        </div>
      </section>

      <div className="space-y-3">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3.5 text-sm font-semibold text-forest-foreground shadow-md transition-transform active:scale-[0.99]">
          Näytä viimeisimmät ilmoitukset
          <ChevronRight className="h-4 w-4" />
        </button>
        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground shadow-sm transition-transform active:scale-[0.99]">
          <Navigation className="h-4 w-4 text-brass" aria-hidden />
          Reittiohjeet
        </button>
      </div>
    </div>
  )
}
