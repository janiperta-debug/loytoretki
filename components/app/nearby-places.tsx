"use client"

import Link from "next/link"
import { ChevronRight, LocateFixed, MapPin } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useUserLocation } from "@/components/app/use-user-location"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

type Place = {
  id: string
  name: string
  category: string
  city: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusKm = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function NearbyPlaces() {
  const { location, loading: locationLoading, error: locationError, requestLocation } = useUserLocation()
  const [places, setPlaces] = useState<Place[]>([])
  const [loadingPlaces, setLoadingPlaces] = useState(true)

  useEffect(() => {
    async function loadPlaces() {
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        setLoadingPlaces(false)
        return
      }

      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/places?select=id,name,category,city,address,latitude,longitude&latitude=not.is.null&longitude=not.is.null`,
          { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
        )
        if (!response.ok) throw new Error("Kohteita ei voitu hakea.")
        setPlaces(await response.json())
      } catch {
        setPlaces([])
      } finally {
        setLoadingPlaces(false)
      }
    }

    loadPlaces()
  }, [])

  const nearby = useMemo(() => {
    if (!location) return []
    return places
      .map((place) => ({
        ...place,
        distance: distanceKm(location.latitude, location.longitude, place.latitude!, place.longitude!),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
  }, [location, places])

  if (locationLoading || loadingPlaces) {
    return (
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <LocateFixed className="h-5 w-5 text-brass" aria-hidden />
          <h2 className="font-serif text-lg font-semibold uppercase tracking-wide text-foreground">Lähelläsi</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Haetaan sijaintiasi ja lähimpiä kohteita…</p>
      </section>
    )
  }

  if (!location) {
    return (
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <LocateFixed className="h-5 w-5 text-brass" aria-hidden />
          <h2 className="font-serif text-lg font-semibold uppercase tracking-wide text-foreground">Lähelläsi</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {locationError ?? "Sijaintia ei ole saatavilla."}
        </p>
        <button
          type="button"
          onClick={requestLocation}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-forest bg-forest px-3.5 py-2 text-sm font-semibold text-forest-foreground"
        >
          <LocateFixed className="h-4 w-4" aria-hidden />
          Käytä sijaintia
        </button>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        <LocateFixed className="h-5 w-5 text-brass" aria-hidden />
        <h2 className="font-serif text-lg font-semibold uppercase tracking-wide text-foreground">Lähelläsi</h2>
      </div>
      {nearby.length ? (
        <div className="mt-3 space-y-2">
          {nearby.map((place) => (
            <Link
              key={place.id}
              href={`/sovellus/kohde/${place.id}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-background/60 p-3 active:bg-secondary"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
                <MapPin className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-serif font-semibold text-foreground">{place.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {place.distance < 1
                    ? `${Math.round(place.distance * 1000)} m`
                    : `${place.distance.toFixed(1).replace(".", ",")} km`}
                  {place.city ? ` · ${place.city}` : ""}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Läheltä ei löytynyt vielä kartalle paikannettuja kohteita.</p>
      )}
    </section>
  )
}
