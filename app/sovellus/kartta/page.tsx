"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ChevronRight, MapPin, Minus, Navigation, Plus, SlidersHorizontal } from "lucide-react"

type Filter = "kaikki" | "kirpputori" | "kierratys" | "muut"
type Place = { id: string; name: string; category: string; address: string | null; city: string | null; latitude: number | null; longitude: number | null }
type Point = { latitude: number; longitude: number }
type MapPlace = Place & { x: number; y: number; markerNumber: number }

const FILTERS: { key: Filter; label: string }[] = [
  { key: "kaikki", label: "Kaikki" }, { key: "kirpputori", label: "Kirpputorit" },
  { key: "kierratys", label: "Kierrätyskeskukset" }, { key: "muut", label: "Muut" },
]
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const TILE = 256
const MIN_ZOOM = 10
const MAX_ZOOM = 18
const INITIAL_CENTER: Point = { latitude: 61.495, longitude: 23.77 }
const INITIAL_ZOOM = 12

function matches(p: Place, f: Filter) {
  if (f === "kaikki") return true
  if (f === "kirpputori") return p.category === "kirpputori"
  if (f === "kierratys") return p.category === "kierratys"
  return ["huutokauppa", "antiikki", "muu"].includes(p.category)
}
function categoryLabel(c: string) {
  return ({ kirpputori: "Kirpputori", kierratys: "Kierrätys", huutokauppa: "Huutokauppa", antiikki: "Antiikki" } as Record<string, string>)[c] ?? "Muu"
}
function worldX(lon: number, z: number) { return ((lon + 180) / 360) * 2 ** z * TILE }
function worldY(lat: number, z: number) {
  const r = (Math.max(-85.05112878, Math.min(85.05112878, lat)) * Math.PI) / 180
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z * TILE
}
function lonFromWorld(x: number, z: number) { const s = 2 ** z * TILE; return ((((x % s) + s) % s) / s) * 360 - 180 }
function latFromWorld(y: number, z: number) { const s = 2 ** z * TILE; return (180 / Math.PI) * Math.atan(Math.sinh((0.5 - y / s) * 2 * Math.PI)) }

function MapCanvas({ places, selectedId, onSelect }: { places: Place[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [center, setCenter] = useState<Point>(INITIAL_CENTER)
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [userLocation, setUserLocation] = useState<Point | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height }))
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const centerWorld = useMemo(() => ({ x: worldX(center.longitude, zoom), y: worldY(center.latitude, zoom) }), [center, zoom])
  const projected = useMemo(() => places.filter(p => p.latitude != null && p.longitude != null).map((p, i) => {
    const ws = 2 ** zoom * TILE
    let dx = worldX(p.longitude!, zoom) - centerWorld.x
    if (dx > ws / 2) dx -= ws
    if (dx < -ws / 2) dx += ws
    return { ...p, x: size.width / 2 + dx, y: size.height / 2 + worldY(p.latitude!, zoom) - centerWorld.y, markerNumber: i + 1 }
  }), [places, centerWorld, zoom, size])

  const tiles = useMemo(() => {
    if (!size.width || !size.height) return []
    const firstX = Math.floor((centerWorld.x - size.width / 2) / TILE) - 1
    const lastX = Math.floor((centerWorld.x + size.width / 2) / TILE) + 1
    const firstY = Math.floor((centerWorld.y - size.height / 2) / TILE) - 1
    const lastY = Math.floor((centerWorld.y + size.height / 2) / TILE) + 1
    const count = 2 ** zoom
    const result: { x: number; y: number; left: number; top: number }[] = []
    for (let x = firstX; x <= lastX; x++) for (let y = firstY; y <= lastY; y++) {
      if (y < 0 || y >= count) continue
      result.push({ x: ((x % count) + count) % count, y, left: size.width / 2 + x * TILE - centerWorld.x, top: size.height / 2 + y * TILE - centerWorld.y })
    }
    return result
  }, [centerWorld, size, zoom])

  function panTo(x: number, y: number) { setCenter({ latitude: latFromWorld(y, zoom), longitude: lonFromWorld(x, zoom) }) }
  function zoomAt(next: number, fx = size.width / 2, fy = size.height / 2) {
    const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next))
    if (z === zoom || !size.width || !size.height) return
    const lon = lonFromWorld(centerWorld.x + fx - size.width / 2, zoom)
    const lat = latFromWorld(centerWorld.y + fy - size.height / 2, zoom)
    const x = worldX(lon, z) - (fx - size.width / 2)
    const y = worldY(lat, z) - (fy - size.height / 2)
    setZoom(z); setCenter({ latitude: latFromWorld(y, z), longitude: lonFromWorld(x, z) })
  }
  function locate() {
    navigator.geolocation?.getCurrentPosition(p => {
      const loc = { latitude: p.coords.latitude, longitude: p.coords.longitude }
      setUserLocation(loc); setCenter(loc); setZoom(Math.max(zoom, 14))
    }, () => {}, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 })
  }

  return <div ref={ref} className="absolute inset-0 cursor-grab touch-none overflow-hidden active:cursor-grabbing" role="application" aria-label="Siirrettävä OpenStreetMap-kartta"
    onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, cx: centerWorld.x, cy: centerWorld.y } }}
    onPointerMove={e => { if (drag.current) panTo(drag.current.cx - (e.clientX - drag.current.x), drag.current.cy - (e.clientY - drag.current.y)) }}
    onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}
    onWheel={e => { e.preventDefault(); const r = ref.current?.getBoundingClientRect(); if (r) zoomAt(zoom + (e.deltaY < 0 ? 1 : -1), e.clientX - r.left, e.clientY - r.top) }}>
    <div className="absolute inset-0 overflow-hidden bg-[#d9d4c7]">
      {tiles.map(t => <img key={`${t.x}-${t.y}-${t.left}`} src={`https://tile.openstreetmap.org/${zoom}/${t.x}/${t.y}.png`} alt="" draggable={false} className="pointer-events-none absolute h-64 w-64 max-w-none select-none" style={{ left: t.left, top: t.top, filter: "sepia(.28) saturate(.68) contrast(.88) brightness(1.05)" }} />)}
      <div className="pointer-events-none absolute inset-0 bg-[oklch(0.9_0.03_80_/_0.38)]" />
    </div>
    <img
      src="/images/app/paper-map.png"
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-multiply"
      style={{
        maskImage: "radial-gradient(ellipse at center, transparent 0%, transparent 58%, black 86%, black 100%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, transparent 0%, transparent 58%, black 86%, black 100%)",
      }}
    />
    <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_24px_oklch(0.35_0.03_60_/_0.18)]" />
    {projected.map(p => <MapMarker key={p.id} place={p} active={p.id === selectedId} onSelect={() => onSelect(p.id)} />)}
    {userLocation && <span className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: size.width / 2 + worldX(userLocation.longitude, zoom) - centerWorld.x, top: size.height / 2 + worldY(userLocation.latitude, zoom) - centerWorld.y }}><span className="block h-4 w-4 rounded-full border-2 border-background bg-info shadow-md" /><span className="absolute inset-0 -z-10 m-auto h-8 w-8 animate-ping rounded-full bg-info/30" /></span>}
    <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-lg border border-border bg-card/90 shadow-md">
      <button type="button" onClick={e => { e.stopPropagation(); zoomAt(zoom + 1) }} className="flex h-11 w-11 items-center justify-center border-b border-border" aria-label="Lähennä karttaa"><Plus className="h-5 w-5" /></button>
      <button type="button" onClick={e => { e.stopPropagation(); zoomAt(zoom - 1) }} className="flex h-11 w-11 items-center justify-center" aria-label="Loitonna karttaa"><Minus className="h-5 w-5" /></button>
    </div>
    <span className="pointer-events-none absolute bottom-1 left-2 rounded bg-card/75 px-1.5 py-0.5 text-[9px] text-muted-foreground">© OpenStreetMap contributors</span>
    <button type="button" onClick={e => { e.stopPropagation(); locate() }} className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-forest shadow-md active:scale-95" aria-label="Keskitä sijaintiisi"><Navigation className="h-5 w-5" /></button>
  </div>
}

function MapMarker({ place, active, onSelect }: { place: MapPlace; active: boolean; onSelect: () => void }) {
  return <button type="button" onClick={e => { e.stopPropagation(); onSelect() }} aria-label={`${place.name}, ${categoryLabel(place.category)}`} className="marker-pop absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center" style={{ left: place.x, top: place.y }} aria-pressed={active}>
    <span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 bg-forest font-serif text-sm font-bold text-[oklch(0.98_0.02_88)] shadow-lg ${active ? "scale-115 ring-2 ring-offset-2" : ""}`} style={{ borderColor: "oklch(0.96 0.02 88 / .85)" }}>{place.markerNumber}</span>
    <span className="-mt-1 h-3 w-3 rotate-45 border-b-2 border-r-2 bg-forest" style={{ borderColor: "oklch(0.96 0.02 88 / .85)" }} />
  </button>
}

export default function KarttaPage() {
  const [filter, setFilter] = useState<Filter>("kaikki")
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!SUPABASE_URL || !SUPABASE_KEY) { setLoading(false); return }
      try {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/places?select=id,name,category,address,city,latitude,longitude&latitude=not.is.null&longitude=not.is.null`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } })
        if (!r.ok) throw new Error()
        setPlaces(await r.json())
      } catch { setPlaces([]) } finally { setLoading(false) }
    }
    load()
  }, [])

  const visible = places.filter(p => matches(p, filter))
  const selected = visible.find(p => p.id === selectedId) ?? visible[0] ?? null
  return <div className="flex flex-col">
    <header className="flex items-center justify-between px-4 pb-3 pt-6"><span className="w-9" /><h1 className="font-serif text-xl font-semibold uppercase tracking-[0.15em]">Retkikartta</h1><button type="button" className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card" aria-label="Kartan suodattimet"><SlidersHorizontal className="h-4 w-4" /></button></header>
    <div className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{FILTERS.map(f => <button key={f.key} type="button" onClick={() => setFilter(f.key)} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium ${filter === f.key ? "border-forest bg-forest text-forest-foreground" : "border-border bg-card"}`}>{f.label}</button>)}</div>
    <div className="relative mx-4 h-[26rem] overflow-hidden rounded-2xl border border-border bg-[#e8e2d2] shadow-inner"><MapCanvas places={visible} selectedId={selected?.id ?? null} onSelect={setSelectedId} />{loading && <div className="absolute inset-0 z-20 flex items-center justify-center bg-card/20"><span className="rounded-full border border-border bg-card/90 px-4 py-2 text-sm text-muted-foreground shadow-sm">Haetaan karttakohteita…</span></div>}</div>
    <div className="px-4 pt-3">{selected ? <SelectedCard place={selected} /> : <p className="rounded-xl border border-dashed border-border bg-card p-4 text-center text-sm text-muted-foreground">Ei kohteita tällä suodattimella. Valitse toinen luokka.</p>}</div>
  </div>
}

function SelectedCard({ place }: { place: Place }) {
  return <Link href={`/sovellus/kohde/${place.id}`} className="block overflow-hidden rounded-2xl border border-border bg-card shadow-md active:bg-secondary"><div className="flex gap-3 p-3"><span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-forest"><MapPin className="h-6 w-6" /></span><div className="min-w-0 flex-1"><h2 className="truncate font-serif text-lg font-semibold">{place.name}</h2><p className="mt-0.5 text-sm text-muted-foreground">{categoryLabel(place.category)}{place.city ? ` · ${place.city}` : ""}</p>{place.address && <p className="mt-1 truncate text-xs text-muted-foreground">{place.address}</p>}</div></div><div className="flex items-center justify-between border-t border-border bg-background/50 px-4 py-2.5"><span className="text-sm font-medium">Avaa kohteen tiedot</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></div></Link>
}
