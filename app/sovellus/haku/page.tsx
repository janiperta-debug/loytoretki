"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, X, MapPin, SlidersHorizontal, Bell, ChevronRight } from "lucide-react"
import { CATEGORY_LABELS } from "@/lib/loytoretki-data"

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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export default function HakuPage() {
  const [query, setQuery] = useState("")
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadPlaces() {
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        setError("Supabase-yhteys ei ole vielä määritetty.")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/places?select=*&order=city.asc,name.asc`,
          { headers: { apikey: SUPABASE_KEY }, cache: "no-store" },
        )

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = (await response.json()) as Place[]
        if (!cancelled) setPlaces(data)
      } catch {
        if (!cancelled) setError("Kohteiden lataaminen ei onnistunut.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPlaces()
    return () => {
      cancelled = true
    }
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return places

    return places.filter((place) => {
      const values = [
        place.name,
        place.city,
        place.address,
        place.description,
        CATEGORY_LABELS[place.category],
      ]
      return values.some((value) => value?.toLowerCase().includes(q))
    })
  }, [places, query])

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
          <h2 className="font-serif text-base font-semibold text-foreground">Löytöretken kompassi</h2>
          <p className="mt-2 text-sm leading-snug text-muted-foreground">
            Kompassi ei lupaa tarkkaa löytöä. Se kertoo myöhemmin havaintojen perusteella, missä kannattaa etsiä.
          </p>
        </section>

        <ul className="mt-5 space-y-3">
          {loading && (
            <li className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Haetaan kohteita…
            </li>
          )}

          {!loading && error && (
            <li className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
              {error}
            </li>
          )}

          {!loading && !error && results.map((place) => (
            <li key={place.id}>
              <Link
                href={`/sovellus/kohde/${place.id}`}
                className="group flex items-stretch gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition-transform active:scale-[0.99]"
              >
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={place.category === "kierratys" ? "/images/app/find-market.png" : "/images/app/find-ceramics.png"}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-secondary-foreground">
                      {CATEGORY_LABELS[place.category]}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                      {place.city ?? ""}
                    </span>
                  </div>
                  <h3 className="mt-1 truncate font-serif text-base font-semibold text-foreground">{place.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{place.address ?? "Sijaintitieto saatavilla"}</p>
                  <p className="mt-auto pt-1 text-sm text-foreground">
                    {place.description ?? "Kohde on nyt mukana Löytöretken tietokannassa."}
                  </p>
                </div>
                <ChevronRight className="my-auto h-5 w-5 shrink-0 self-center text-muted-foreground transition-transform group-active:translate-x-0.5" />
              </Link>
            </li>
          ))}

          {!loading && !error && results.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
              Ei kohteita haulle {'"'}{query}{'"'}. Havaintoihin perustuva etsintä täydentyy seuraavassa vaiheessa.
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
