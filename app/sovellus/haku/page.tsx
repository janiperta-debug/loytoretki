"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, X, MapPin, SlidersHorizontal, Bell, ChevronRight, Compass } from "lucide-react"
import { CATEGORY_LABELS, SCORE_META } from "@/lib/loytoretki-data"

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

type Product = {
  id: string
  name: string
  description: string | null
  category: string | null
  keywords: string[]
}

type CompassResult = {
  place_id: string
  place_name: string
  city: string | null
  score: number
  level: keyof typeof SCORE_META
  observations_count: number
  total_quantity: number
  latest_observed_at: string
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export default function HakuPage() {
  const [query, setQuery] = useState("")
  const [places, setPlaces] = useState<Place[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [compassResults, setCompassResults] = useState<CompassResult[]>([])
  const [loading, setLoading] = useState(true)
  const [compassLoading, setCompassLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        setError("Supabase-yhteys ei ole vielä määritetty.")
        setLoading(false)
        return
      }

      try {
        const [placesResponse, productsResponse] = await Promise.all([
          fetch(
            `${SUPABASE_URL}/rest/v1/places?select=*&order=city.asc,name.asc`,
            { headers: { apikey: SUPABASE_KEY }, cache: "no-store" },
          ),
          fetch(
            `${SUPABASE_URL}/rest/v1/products?select=id,name,description,category,keywords&order=name.asc`,
            { headers: { apikey: SUPABASE_KEY }, cache: "no-store" },
          ),
        ])

        if (!placesResponse.ok) throw new Error(`Places HTTP ${placesResponse.status}`)
        if (!productsResponse.ok) throw new Error(`Products HTTP ${productsResponse.status}`)

        const [placeData, productData] = await Promise.all([
          placesResponse.json() as Promise<Place[]>,
          productsResponse.json() as Promise<Product[]>,
        ])

        if (!cancelled) {
          setPlaces(placeData)
          setProducts(productData)
        }
      } catch {
        if (!cancelled) setError("Tietojen lataaminen ei onnistunut.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
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

  const matchedProduct = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null

    return (
      products.find((product) => product.name.toLowerCase() === q) ??
      products.find((product) =>
        [product.name, ...(product.keywords ?? [])].some((value) => value.toLowerCase().includes(q)),
      ) ??
      null
    )
  }, [products, query])

  useEffect(() => {
    let cancelled = false

    async function loadCompass() {
      if (!SUPABASE_URL || !SUPABASE_KEY || !matchedProduct) {
        setCompassResults([])
        setCompassLoading(false)
        return
      }

      setCompassLoading(true)

      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_compass_for_product`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ target_product_id: matchedProduct.id }),
          cache: "no-store",
        })

        if (!response.ok) throw new Error(`Compass HTTP ${response.status}`)

        const data = (await response.json()) as CompassResult[]
        if (!cancelled) setCompassResults(data)
      } catch {
        if (!cancelled) setCompassResults([])
      } finally {
        if (!cancelled) setCompassLoading(false)
      }
    }

    loadCompass()
    return () => {
      cancelled = true
    }
  }, [matchedProduct])

  const compassMeta = matchedProduct ? SCORE_META : null

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
            Kompassi ei lupaa tarkkaa löytöä. Se kertoo havaintojen perusteella, missä kannattaa etsiä.
          </p>
        </section>

        {matchedProduct && (
          <section className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-brass" aria-hidden />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Kompassi</p>
                <h2 className="font-serif text-lg font-semibold text-foreground">{matchedProduct.name}</h2>
              </div>
            </div>

            {compassLoading && (
              <p className="mt-4 text-sm text-muted-foreground">Lasketaan havaintoihin perustuvaa kompassia…</p>
            )}

            {!compassLoading && compassResults.length > 0 && (
              <div className="mt-4 space-y-3">
                {compassResults.map((result) => {
                  const meta = SCORE_META[result.level]
                  return (
                    <Link
                      key={result.place_id}
                      href={`/sovellus/kohde/${result.place_id}`}
                      className="block rounded-xl border border-border bg-background p-3 transition-transform active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-serif text-base font-semibold text-foreground">{result.place_name}</h3>
                          <p className="text-xs text-muted-foreground">{result.city ?? ""}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                          {result.score} · {meta.label}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{meta.blurb}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {result.observations_count} havainto{result.observations_count === 1 ? "" : "a"} · määrä {result.total_quantity}
                      </p>
                    </Link>
                  )
                })}
              </div>
            )}

            {!compassLoading && compassResults.length === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                Tästä tuotteesta ei ole vielä havaintoja, joiden perusteella kompassi voisi ohjata.
              </p>
            )}
          </section>
        )}

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

          {!loading && !error && results.length === 0 && !matchedProduct && (
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
