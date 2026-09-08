"use client"

import { useCallback, useEffect, useState } from "react"

export type UserLocation = {
  latitude: number
  longitude: number
  accuracy: number | null
}

type LocationState = {
  location: UserLocation | null
  loading: boolean
  error: string | null
}

export function useUserLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: true,
    error: null,
  })

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ location: null, loading: false, error: "Selaimesi ei tue paikannusta." })
      return
    }

    setState((current) => ({ ...current, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          loading: false,
          error: null,
        })
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Paikannus ei ole käytössä. Voit silti käyttää Löytöretkeä ilman sijaintia."
            : "Sijaintia ei saatu haettua juuri nyt."
        setState({ location: null, loading: false, error: message })
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 },
    )
  }, [])

  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  return { ...state, requestLocation }
}
