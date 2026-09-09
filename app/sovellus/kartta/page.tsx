"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { SlidersHorizontal, Navigation, ChevronRight, MapPin } from "lucide-react"

type Filter = "kaikki" | "kirpputori" | "kierratys" | "muut"

type Place = {
  id: string
  name: string
  category: string
  address: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
}

type MapPlace = Place & { dx: number; dy: number; markerNumber: number }
type Tile = { x: number; y: number; left: number; top: number }

const FILTERS: { key: Filter; label: string }[] = [
  { key: "kaikki", label: "Kaikki" },
  { key: "kirpputori", label: "Kirpputorit" },
  { key: "kierratys", label: "Kierrätyskeskukset" },
  { key: "muut", label: "Muut" },
]

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const TILE_SIZE = 256
const MAP_ZOOM = 12

function matches(place: Place, filter: Filter) {
  if (filter === "kaikki") return true
  if (filter === "kirpputori") return place.category === "kirpputori"
  if (filter === "kierratys") return place.category === "kierratys"
  return ["huutokauppa", "antiikki", "muu"].includes(place.category)
}

function categoryLabel(category: string) {
  switch (category) {
    case "kirpputori":
      return "Kirpputori"
    case "kierratys":
      return "Kierrätys"
    case "huutokauppa":
      return "Huutokauppa"
    case "antiikki":
      return "Antiikki"
    default:
      return "Muu"
  }
}

function lonToPixel(lon: number, zoom: number) {
  return ((lon + 180) / 360) * 2 ** zoom * TILE_SIZE
}

function latToPixel(lat: number, zoom: number) {
  const latRad = (lat * Math.PI) / 180
  return (
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    2 ** zoom *
    TILE_SIZE
  )
}

function getMapCenter(places: Place[]) {
  const located = places.filter((place) => place.latitude != null && place.longitude != null)
  if (!located.length) return null

  const lats = located.map((place) => place.latitude!)
  const lngs = located.map((place) => place.longitude!)

  return {
    latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
    longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  }
}

function getTiles(center: { latitude: number; longitude: number }): Tile[] {
  const centerX = lonToPixel(center.longitude, MAP_ZOOM)
  const centerY = latToPixel(center.latitude, MAP_ZOOM)
  const centerTileX = Math.floor(centerX / TILE_SIZE)
  const centerTileY = Math.floor(centerY / TILE_SIZE)
  const offsetX = centerX - centerTileX * TILE_SIZE
  const offsetY = centerY - centerTileY * TILE_SIZE

  return [-2, -1, 0, 1, 2].flatMap((dx) =>
    [-2, -1, 0, 1, 2].map((dy) => ({
      x: centerTileX + dx,
      y: centerTileY + dy,
      left: -offsetX - TILE_SIZE / 2 + dx * TILE_SIZE,
      top: -offsetY - TILE_SIZE / 2 + dy * TILE_SIZE,
    })),
  )
}

function projectToMap(places: Place[], center: { latitude: number; longitude: number } | null): MapPlace[] {
  if (!center) return []

  const centerX = lonToPixel(center.longitude, MAP_ZOOM)
  const centerY = latToPixel(center.latitude, MAP_ZOOM)

  return places
    .filter((place) => place.latitude != null && place.longitude != null)
    .map((place, index) => ({
      ...place,
      dx: lonToPixel(place.longitude!, MAP_ZOOM) - centerX,
      dy: latToPixel(place.latitude!, MAP_ZOOM) - centerY,
      markerNumber: index + 1,
    }))
}

export default function KarttaPage() {
  const [filter, setFilter] = useState<Filter>("kaikki")
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    async function loadPlaces() {
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/places?select=id,name,category,address,city,latitude,longitude&latitude=not.is.null&longitude=not.is.null`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
        )
        if (!response.ok) throw new Error("Kohteita ei voitu hakea.")
        setPlaces(await response.json())
      } catch {
        setPlaces([])
      } finally {
        setLoading(false)
      }
    }

    loadPlaces()
  }, [])

  const mapCenter = useMemo(() => getMapCenter(places), [places])
  const tiles = useMemo(() => (mapCenter ? getTiles(mapCenter) : []), [mapCenter])
  const mapPlaces = useMemo(() => projectToMap(places, mapCenter), [places, mapCenter])
  const visible = mapPlaces.filter((place) => matches(place, filter))
  const selected = visible.find((place) => place.id === selectedId) ?? visible[0] ?? null

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

      <div className="relative mx-4 h-[26rem] overflow-hidden rounded-2xl border border-border bg-[#e8e2d2] shadow-inner">
        {mapCenter ? (
          <div className="absolute inset-0 overflow-hidden bg-[#d8d0bd]" aria-label="OpenStreetMap-kartta">
            {tiles.map((tile) => (
              <img
                key={`${tile.x}-${tile.y}`}
                src={`https://tile.openstreetmap.org/${MAP_ZOOM}/${tile.x}/${tile.y}.png`}
                alt=""
                className="pointer-events-none absolute h-64 w-64 max-w-none"
                style={{ left: `calc(50% + ${tile.left}px)`, top: `calc(50% + ${tile.top}px)` }}
              />
            ))}
            <div className="pointer-events-none absolute inset-0 bg-[oklch(0.9_0.03_80_/_0.18)]" />
            <img
              src="/images/app/paper-map.png"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-multiply"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[oklch(0.9_0.03_80)]" />
        )}

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full border border-border bg-card/90 px-4 py-2 text-sm text-muted-foreground shadow-sm">
              Haetaan karttakohteita…
            </span>
          </div>
        ) : visible.length ? (
          visible.map((place) => (
            <MapMarker
              key={place.id}
              place={place}
              active={place.id === selected?.id}
              onSelect={() => setSelectedId(place.id)}
            />
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
            <span className="rounded-xl border border-border bg-card/90 px-4 py-3 text-sm text-muted-foreground shadow-sm">
              Ei kartalle paikannettuja kohteita tällä suodattimella.
            </span>
          </div>
        )}

        <span
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: "50%", top: "48%" }}
          aria-label="Sijaintisi"
        >
          <span className="block h-4 w-4 rounded-full border-2 border-background bg-info shadow-md" />
          <span className="absolute inset-0 -z-10 m-auto h-8 w-8 animate-ping rounded-full bg-info/30" />
        </span>

        <span className="pointer-events-none absolute bottom-1 left-2 rounded bg-card/75 px-1.5 py-0.5 text-[9px] text-muted-foreground">
          © OpenStreetMap contributors
        </span>

        <button
          type="button"
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-forest shadow-md active:scale-95"
          aria-label="Keskitä sijaintiisi"
        >
          <Navigation className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="px-4 pt-3">
        {selected ? (
          <SelectedCard place={selected} />
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
  place,
  active,
  onSelect,
}: {
  place: MapPlace
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${place.name}, ${categoryLabel(place.category)}`}
      className="marker-pop absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
      style={{ left: `calc(50% + ${place.dx}px)`, top: `calc(48% + ${place.dy}px)` }}
      aria-pressed={active}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 bg-forest font-serif text-sm font-bold text-[oklch(0.98_0.02_88)] shadow-lg transition-transform ${
          active ? "scale-115 ring-2 ring-offset-2 ring-offset-transparent" : ""
        }`}
        style={{ borderColor: "oklch(0.96 0.02 88 / 0.85)", boxShadow: "0 4px 10px oklch(0.2 0.02 60 / 0.4)" }}
      >
        {place.markerNumber}
      </span>
      <span
        className="-mt-1 h-3 w-3 rotate-45 border-b-2 border-r-2 bg-forest"
        style={{ borderColor: "oklch(0.96 0.02 88 / 0.85)" }}
        aria-hidden="true"
      />
    </button>
  )
}

function SelectedCard({ place }: { place: MapPlace }) {
  return (
    <Link
      href={`/sovellus/kohde/${place.id}`}
      className="block overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-colors active:bg-secondary"
    >
      <div className="flex gap-3 p-3">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-forest">
          <MapPin className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-serif text-lg font-semibold text-foreground">{place.name}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {categoryLabel(place.category)}{place.city ? ` · ${place.city}` : ""}
          </p>
          {place.address ? <p className="mt-1 truncate text-xs text-muted-foreground">{place.address}</p> : null}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border bg-background/50 px-4 py-2.5">
        <span className="text-sm font-medium text-foreground">Avaa kohteen tiedot</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
    </Link>
  )
}
