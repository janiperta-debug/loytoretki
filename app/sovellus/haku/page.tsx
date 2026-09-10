"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Search, X, MapPin, SlidersHorizontal, Bell, Compass } from "lucide-react"
import { SCORE_META } from "@/lib/loytoretki-data"
import { supabase } from "@/lib/supabase"

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

type User = { id: string }

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export default function HakuPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [compassResults, setCompassResults] = useState<CompassResult[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [compassLoading, setCompassLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initialQuery = searchParams.get("q") ?? ""
    setQuery(initialQuery)
  }, [searchParams])

  useEffect(() => {
    let cancelled = false

    async function initAuth() {
      const { data } = await supabase.auth.getUser()
      if (!cancelled) setUser(data.user ? { id: data.user.id } : null)
    }

    initAuth()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setUser(session?.user ? { id: session.user.id } : null)
    })
    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        setError("Supabase-yhteys ei ole vielä määritetty.")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/products?select=id,name,description,category,keywords&order=name.asc`,
          { headers: { apikey: SUPABASE_KEY }, cache: "no-store" },
        )

        if (!response.ok) throw new Error(`Products HTTP ${response.status}`)

        const data = (await response.json()) as Product[]
        if (!cancelled) setProducts(data)
      } catch {
        if (!cancelled) setError("Tuotteiden lataaminen ei onnistunut.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProducts()
    return () => {
      cancelled = true
    }
  }, [])

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

  async function saveSearch() {
    const term = query.trim()
    if (!term || !user || saving) return

    setSaving(true)
    setSaveMessage(null)

    const { data: existing } = await supabase
      .from("searches")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", term)
      .limit(1)
      .maybeSingle()

    if (existing) {
      setSaveMessage("Haku on jo tallennettu profiiliisi.")
      setSaving(false)
      return
    }

    const { data: search, error: searchError } = await supabase
      .from("searches")
      .insert({ user_id: user.id, name: term })
      .select("id")
      .single()

    if (searchError || !search) {
      setSaveMessage("Hakua ei voitu tallentaa. Yritä uudelleen.")
      setSaving(false)
      return
    }

    const { error: termError } = await supabase.from("search_terms").insert({
      search_id: search.id,
      term,
      source: "product",
      weight: 1,
    })

    if (termError) {
      await supabase.from("searches").delete().eq("id", search.id).eq("user_id", user.id)
      setSaveMessage("Hakua ei voitu tallentaa. Yritä uudelleen.")
    } else {
      setSaveMessage("Haku tallennettu profiiliisi.")
    }

    setSaving(false)
  }

  const resultCount = matchedProduct ? compassResults.length : 0

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
            onChange={(e) => { setQuery(e.target.value); setSaveMessage(null) }}
            placeholder="Mitä etsit?"
            aria-label="Hakusana"
            className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <span className="shrink-0 rounded-md bg-secondary px-2 py-0.5 text-sm font-semibold text-secondary-foreground tabular-nums">
            {resultCount}
          </span>
          {query && (
            <button
              onClick={() => { setQuery(""); setSaveMessage(null) }}
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
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                          <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} aria-hidden />
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{meta.blurb}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {result.observations_count} havainto{result.observations_count === 1 ? "" : "a"}
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

        {!loading && !error && query.trim() && !matchedProduct && (
          <section className="mt-5 rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
            Tuotetta ei löytynyt haulle {'"'}{query}{'"'}.
          </section>
        )}

        {loading && (
          <section className="mt-5 rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Haetaan tuotteita…
          </section>
        )}

        {!loading && error && (
          <section className="mt-5 rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
            {error}
          </section>
        )}

        {!user ? (
          <Link href="/sovellus/kirjaudu" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground shadow-sm transition-transform active:scale-[0.99]">
            <Bell className="h-4 w-4 text-brass" aria-hidden />
            Kirjaudu tallentaaksesi haun
          </Link>
        ) : (
          <button
            type="button"
            onClick={saveSearch}
            disabled={!query.trim() || saving}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 text-sm font-semibold text-foreground shadow-sm transition-transform active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Bell className="h-4 w-4 text-brass" aria-hidden />
            {saving ? "Tallennetaan…" : "Tallenna haku"}
          </button>
        )}

        {saveMessage && <p className="mt-2 text-center text-xs text-muted-foreground">{saveMessage}</p>}
      </div>
    </div>
  )
}

function FilterChip({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <button type="button" className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground shadow-sm transition-transform active:scale-95">
      {icon && <span className="text-brass">{icon}</span>}
      {label}
    </button>
  )
}
