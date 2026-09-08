"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ChevronLeft, Share2, Heart, MapPin, Clock, Navigation, ChevronRight } from "lucide-react"
import { CATEGORY_LABELS } from "@/lib/loytoretki-data"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const TABS = ["Yleiskatsaus", "Ilmoitukset", "Pöydät", "Arviot"] as const

type Place = {
  id: string
  name: string
  category: keyof typeof CATEGORY_LABELS
  description: string | null
  address: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  website: string | null
  phone: string | null
  opening_hours: unknown | null
}

type Observation = {
  id: string
  text: string
  quantity: number | null
  observed_at: string
  source: string
  products: { name: string } | null
}

export default function KohdePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [place, setPlace] = useState<Place | null>(null)
  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState(true)
  const [observationsLoading, setObservationsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState<(typeof TABS)[number]>("Yleiskatsaus")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadPlace() {
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        setError(true)
        setLoading(false)
        setObservationsLoading(false)
        return
      }

      try {
        const headers = {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        }

        const [placeResponse, observationsResponse] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/places?id=eq.${encodeURIComponent(id)}&select=*`, {
            headers,
            cache: "no-store",
          }),
          fetch(
            `${SUPABASE_URL}/rest/v1/observations?place_id=eq.${encodeURIComponent(id)}&select=id,text,quantity,observed_at,source,products(name)&order=observed_at.desc`,
            { headers, cache: "no-store" },
          ),
        ])

        if (!placeResponse.ok) throw new Error("Failed to load place")

        const rows = (await placeResponse.json()) as Place[]
        if (!cancelled) {
          setPlace(rows[0] ?? null)
          setError(false)
        }

        if (observationsResponse.ok) {
          const observationRows = (await observationsResponse.json()) as Observation[]
          if (!cancelled) setObservations(observationRows)
        }
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) {
          setLoading(false)
          setObservationsLoading(false)
        }
      }
    }

    loadPlace()
    return () => {
      cancelled = true
    }
  }, [id])

  if (!loading && (error || !place)) notFound()

  return (
    <div className="min-h-full">
      <div className="relative h-60 w-full bg-secondary">
        <Image src="/placeholder.svg" alt="" fill className="object-cover opacity-60" sizes="480px" priority />
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

      <div className="relative -mt-10 px-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-lg">
          {loading || !place ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-7 w-2/3 rounded bg-secondary" />
              <div className="h-4 w-1/2 rounded bg-secondary" />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <h1 className="font-serif text-2xl font-semibold text-foreground text-balance">{place.name}</h1>
                <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brass/40 text-brass">
                  <Navigation className="h-5 w-5" strokeWidth={1.6} />
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {place.city && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-brass" aria-hidden />
                    {place.city}
                  </span>
                )}
                {place.address && <span>{place.address}</span>}
              </div>
              <div className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-brass">
                {CATEGORY_LABELS[place.category] ?? place.category}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 px-4">
        <div role="tablist" aria-label="Kohteen tiedot" className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-secondary/60 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-5">
        {tab === "Yleiskatsaus" && place ? (
          <Overview place={place} onShowObservations={() => setTab("Ilmoitukset")} />
        ) : tab === "Ilmoitukset" ? (
          <Observations observations={observations} loading={observationsLoading} />
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

function Overview({ place, onShowObservations }: { place: Place; onShowObservations: () => void }) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-serif text-lg font-semibold text-foreground">Kohteen tiedot</h2>
        <div className="mt-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
          {place.description && <p className="text-sm leading-relaxed text-muted-foreground">{place.description}</p>}
          {place.phone && <p className="mt-3 text-sm text-foreground">{place.phone}</p>}
          {place.website && <p className="mt-1 break-all text-sm text-muted-foreground">{place.website}</p>}
          {place.opening_hours && (
            <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brass" aria-hidden />
              <span>{formatOpeningHours(place.opening_hours)}</span>
            </div>
          )}
        </div>
      </section>

      <div className="space-y-3">
        <button onClick={onShowObservations} className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3.5 text-sm font-semibold text-forest-foreground shadow-md transition-transform active:scale-[0.99]">
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

function Observations({ observations, loading }: { observations: Observation[]; loading: boolean }) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Haetaan ilmoituksia…</p>
  }

  if (!observations.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
        <p className="font-serif text-base text-foreground">Ei vielä ilmoituksia</p>
        <p className="mt-1 text-sm text-muted-foreground">Ole ensimmäinen, joka kertoo mitä täältä löytyi.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-serif text-lg font-semibold text-foreground">Viimeisimmät ilmoitukset</h2>
        <p className="mt-1 text-sm text-muted-foreground">Yhteisön tuoreimmat havainnot tästä kohteesta.</p>
      </div>
      {observations.map((observation) => (
        <article key={observation.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-serif font-semibold text-foreground">{observation.products?.name ?? "Havainto"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatObservedAt(observation.observed_at)}</p>
            </div>
            {observation.quantity !== null ? (
              <span className="shrink-0 rounded-full border border-brass/40 px-2.5 py-1 text-xs font-semibold text-brass">
                {observation.quantity} kpl
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{observation.text}</p>
        </article>
      ))}
    </div>
  )
}

function formatObservedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("fi-FI", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function formatOpeningHours(value: unknown) {
  if (!value) return ""
  if (typeof value === "string") return value
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([day, hours]) => `${day}: ${String(hours)}`)
      .join(" · ")
  }
  return String(value)
}
