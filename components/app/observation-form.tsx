"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { Check, LocateFixed, MapPin, Plus, Send } from "lucide-react"
import { useUserLocation } from "@/components/app/use-user-location"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const MAX_DISTANCE_KM = 5

type Place = { id: string; name: string; category: string; city: string | null; address: string | null; latitude: number | null; longitude: number | null }
type Product = { id: string; name: string; category: string | null; keywords: string[] }

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusKm = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function placeLabel(place: Place) {
  return `${place.name}${place.city ? ` · ${place.city}` : ""}`
}

export function ObservationForm() {
  const { location, loading: locationLoading, error: locationError, requestLocation } = useUserLocation()
  const [places, setPlaces] = useState<Place[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedPlaceId, setSelectedPlaceId] = useState("")
  const [selectedProductId, setSelectedProductId] = useState("")
  const [placeQuery, setPlaceQuery] = useState("")
  const [productQuery, setProductQuery] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      if (!SUPABASE_URL || !SUPABASE_KEY) { setError("Tietokantayhteyttä ei ole määritetty."); setLoading(false); return }
      try {
        const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        const [placesResponse, productsResponse] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/places?select=id,name,category,city,address,latitude,longitude&latitude=not.is.null&longitude=not.is.null`, { headers }),
          fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,category,keywords&order=name.asc`, { headers }),
        ])
        if (!placesResponse.ok || !productsResponse.ok) throw new Error()
        setPlaces(await placesResponse.json())
        setProducts(await productsResponse.json())
      } catch { setError("Havaintoa ei voitu valmistella juuri nyt.") }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const nearbyPlaces = useMemo(() => {
    if (!location) return []
    return places.map((place) => ({ ...place, distance: distanceKm(location.latitude, location.longitude, place.latitude!, place.longitude!) }))
      .filter((place) => place.distance <= MAX_DISTANCE_KM).sort((a, b) => a.distance - b.distance).slice(0, 5)
  }, [location, places])

  const searchedPlaces = useMemo(() => {
    const query = placeQuery.trim().toLocaleLowerCase("fi-FI")
    if (!query) return places.slice(0, 8)
    return places.filter((place) => [place.name, place.city ?? "", place.address ?? "", place.category].join(" ").toLocaleLowerCase("fi-FI").includes(query)).slice(0, 8)
  }, [placeQuery, places])

  const filteredProducts = useMemo(() => {
    const query = productQuery.trim().toLocaleLowerCase("fi-FI")
    if (!query) return products.slice(0, 8)
    return products.filter((product) => [product.name, product.category ?? "", ...(product.keywords ?? [])].join(" ").toLocaleLowerCase("fi-FI").includes(query)).slice(0, 8)
  }, [productQuery, products])

  const selectedPlace = places.find((place) => place.id === selectedPlaceId)
  const selectedProduct = products.find((product) => product.id === selectedProductId)
  const placeIsSelected = Boolean(selectedPlaceId && selectedPlace && placeQuery === placeLabel(selectedPlace))
  const productIsSelected = Boolean(selectedProductId && selectedProduct && productQuery === selectedProduct.name)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null); setSuccess(false)
    if (!selectedPlaceId || !selectedProductId) { setError("Valitse paikka ja tuote."); return }
    const parsedQuantity = Number.parseInt(quantity, 10)
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) { setError("Määrän pitää olla vähintään 1."); return }
    if (!SUPABASE_URL || !SUPABASE_KEY) { setError("Tietokantayhteyttä ei ole määritetty."); return }
    setSaving(true)
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/observations`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ place_id: selectedPlaceId, product_id: selectedProductId, user_id: null, quantity: parsedQuantity, text: text.trim() || `${selectedProduct?.name ?? "Tuotetta"} havaittu paikassa.`, source: "user", observed_at: new Date().toISOString() }),
      })
      if (!response.ok) throw new Error()
      setSuccess(true); setText(""); setQuantity("1")
    } catch { setError("Havainnon tallennus epäonnistui. Yritä uudelleen.") }
    finally { setSaving(false) }
  }

  return (
    <section className="paper-grain rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2.5"><Plus className="h-5 w-5 text-brass" aria-hidden /><div><h2 className="font-serif text-lg font-semibold uppercase tracking-wide text-foreground">Tee havainto</h2><p className="text-xs text-muted-foreground">Kerro muille, mitä löysit.</p></div></div>
      {loading ? <p className="mt-4 text-sm text-muted-foreground">Valmistellaan havaintoa…</p> : null}

      {!loading && !location ? <div className="mt-4 rounded-lg border border-border bg-background/60 p-3"><div className="flex items-start gap-2.5"><LocateFixed className="mt-0.5 h-4 w-4 shrink-0 text-forest" aria-hidden /><div><p className="text-sm font-medium text-foreground">Sijainti ei ole käytössä</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Voit silti tehdä havainnon valitsemalla paikan haulla. Sijaintia käytetään vain lähimmän paikan ehdottamiseen.</p><button type="button" onClick={requestLocation} disabled={locationLoading} className="mt-3 inline-flex items-center gap-2 rounded-full border border-forest bg-forest px-3.5 py-2 text-sm font-semibold text-forest-foreground disabled:opacity-60"><LocateFixed className="h-4 w-4" aria-hidden />{locationLoading ? "Haetaan sijaintia…" : "Käytä sijaintia"}</button></div></div>{locationError ? <p className="mt-2 text-xs text-muted-foreground">{locationError}</p> : null}</div> : null}

      {!loading ? <form onSubmit={submit} className="mt-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Missä?</label>
          {nearbyPlaces.length ? <><p className="mb-2 text-xs text-muted-foreground">Lähimmät kohteet</p><div className="space-y-2">{nearbyPlaces.map((place) => <PlaceOption key={place.id} place={place} selected={selectedPlaceId === place.id} distance={place.distance} onSelect={() => { setSelectedPlaceId(place.id); setPlaceQuery(placeLabel(place)) }} />)}</div></> : null}
          <div className={nearbyPlaces.length ? "mt-3" : ""}><label htmlFor="observation-place-search" className="sr-only">Hae paikkaa</label><input id="observation-place-search" value={placeQuery} onChange={(event) => { const value = event.target.value; setPlaceQuery(value); if (value !== (selectedPlace ? placeLabel(selectedPlace) : "")) setSelectedPlaceId("") }} placeholder={nearbyPlaces.length ? "Tai hae toinen paikka…" : "Hae paikkaa…"} autoComplete="off" className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-forest ${placeIsSelected ? "border-forest" : "border-border"}`} />{placeIsSelected ? <p className="mt-1.5 flex items-center gap-1.5 text-xs text-forest"><Check className="h-3.5 w-3.5" aria-hidden />Paikka valittu</p> : placeQuery ? <div className="mt-2 space-y-1.5">{searchedPlaces.map((place) => <button key={place.id} type="button" onClick={() => { setSelectedPlaceId(place.id); setPlaceQuery(placeLabel(place)) }} className={`flex w-full items-center justify-between rounded-lg border p-2.5 text-left text-sm ${selectedPlaceId === place.id ? "border-forest bg-forest/5" : "border-border bg-background/60"}`}><span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-forest" aria-hidden /><span><span className="block font-medium text-foreground">{place.name}</span><span className="block text-xs text-muted-foreground">{place.city ?? place.address ?? ""}</span></span></span>{selectedPlaceId === place.id ? <Check className="h-4 w-4 text-forest" aria-hidden /> : null}</button>)}{!searchedPlaces.length ? <p className="text-xs text-muted-foreground">Paikkaa ei löytynyt.</p> : null}</div> : null}</div>
          {selectedPlace ? <p className="mt-1.5 text-xs text-muted-foreground">Valittu paikka: {placeLabel(selectedPlace)}</p> : null}
        </div>

        <div><label htmlFor="observation-product" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mitä löysit?</label><input id="observation-product" value={productQuery} onChange={(event) => { const value = event.target.value; setProductQuery(value); const exactMatch = products.find((product) => product.name.toLocaleLowerCase("fi-FI") === value.trim().toLocaleLowerCase("fi-FI")); setSelectedProductId(exactMatch ? exactMatch.id : "") }} placeholder="Hae tuotetta…" autoComplete="off" className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-forest ${productIsSelected ? "border-forest" : "border-border"}`} />{productIsSelected ? <p className="mt-1.5 flex items-center gap-1.5 text-xs text-forest"><Check className="h-3.5 w-3.5" aria-hidden />Tuote valittu</p> : <div className="mt-2 space-y-1.5">{filteredProducts.map((product) => <button key={product.id} type="button" onClick={() => { setSelectedProductId(product.id); setProductQuery(product.name) }} className={`flex w-full items-center justify-between rounded-lg border p-2.5 text-left text-sm ${selectedProductId === product.id ? "border-forest bg-forest/5" : "border-border bg-background/60"}`}><span className="font-medium text-foreground">{product.name}</span>{selectedProductId === product.id ? <Check className="h-4 w-4 text-forest" aria-hidden /> : null}</button>)}{!filteredProducts.length ? <p className="text-xs text-muted-foreground">Tuotetta ei löytynyt vielä.</p> : null}</div>}</div>

        <div className="grid grid-cols-[6rem_1fr] gap-3"><div><label htmlFor="observation-quantity" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Määrä</label><input id="observation-quantity" type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-forest" /></div><div><label htmlFor="observation-note" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Huomio <span className="font-normal normal-case tracking-normal">(valinnainen)</span></label><input id="observation-note" value={text} onChange={(event) => setText(event.target.value)} placeholder="Esim. useita kokoja" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-forest" /></div></div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}{success ? <div className="rounded-lg border border-forest/30 bg-forest/5 p-3 text-sm text-foreground">Havainto tallennettu. Kiitos — tästä on hyötyä myös muille löytöretkeilijöille.</div> : null}
        <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-forest bg-forest px-4 py-2.5 text-sm font-semibold text-forest-foreground disabled:opacity-60"><Send className="h-4 w-4" aria-hidden />{saving ? "Tallennetaan…" : "Tallenna havainto"}</button>
        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">Havainnon voi tehdä ilman kirjautumista. Myöhemmin kirjautuminen yhdistää omat havainnot profiiliisi.</p>
      </form> : null}
    </section>
  )
}

function PlaceOption({ place, selected, distance, onSelect }: { place: Place; selected: boolean; distance: number; onSelect: () => void }) {
  return <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${selected ? "border-forest bg-forest/5" : "border-border bg-background/60"}`}><input type="radio" name="place" value={place.id} checked={selected} onChange={onSelect} className="sr-only" /><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest"><MapPin className="h-4 w-4" aria-hidden /></span><span className="min-w-0 flex-1"><span className="block truncate font-serif font-semibold text-foreground">{place.name}</span><span className="block text-xs text-muted-foreground">{distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1).replace(".", ",")} km`}{place.city ? ` · ${place.city}` : ""}</span></span>{selected ? <Check className="h-5 w-5 shrink-0 text-forest" aria-hidden /> : null}</label>
}
