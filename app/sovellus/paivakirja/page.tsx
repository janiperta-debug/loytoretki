"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarDays, MapPin, Plus, UserRound } from "lucide-react"
import { ObservationForm } from "@/components/app/observation-form"
import { supabase } from "@/lib/supabase"

type Observation = {
  id: string
  text: string
  observed_at: string
  source: string
  place: { id: string; name: string; city: string | null } | null
  product: { id: string; name: string } | null
}

export default function PaivakirjaPage() {
  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState(true)

  async function loadObservations() {
    const { data } = await supabase
      .from("observations")
      .select("id, text, observed_at, source, place:places(id, name, city), product:products(id, name)")
      .order("observed_at", { ascending: false })
      .limit(50)

    setObservations((data ?? []) as Observation[])
    setLoading(false)
  }

  useEffect(() => {
    loadObservations()
  }, [])

  return (
    <div className="min-h-full">
      <header className="border-b border-border/70 bg-card/80 px-5 pb-4 pt-6 backdrop-blur">
        <h1 className="text-center font-serif text-lg font-semibold uppercase tracking-[0.12em] text-foreground">Retkeilijän loki</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground text-balance">Tuoreita havaintoja kirpputoreilta, liikkeistä ja löytöretkiltä.</p>
      </header>

      <div className="px-5 py-5">
        <ObservationForm />

        <div className="mb-4 mt-7 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">Tuoreimmat havainnot</h2>
            <p className="mt-1 text-sm text-muted-foreground">Mitä muut löytöretkeilijät ovat nähneet.</p>
          </div>
          <Link href="/sovellus/profiili#oma-paivakirja" className="shrink-0 text-sm font-medium text-brass">Oma päiväkirja</Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-7 text-center text-sm text-muted-foreground">Ladataan havaintoja…</div>
        ) : observations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-7 text-center">
            <MapPin className="mx-auto h-7 w-7 text-brass" />
            <h2 className="mt-3 font-serif text-lg font-semibold text-foreground">Loki on vielä tyhjä</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Ole ensimmäinen ja kerro muille, mitä löysit.</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {observations.map((observation) => (
              <li key={observation.id}>
                <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest/10 text-forest">
                      <UserRound className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {observation.place && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-brass" aria-hidden />{observation.place.name}</span>}
                        <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5 text-brass" aria-hidden />{formatDateTime(observation.observed_at)}</span>
                      </div>
                      {observation.product && <p className="mt-2 font-serif text-base font-semibold text-foreground">{observation.product.name}</p>}
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground/90">{observation.text}</p>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center">
          <p className="font-serif text-base text-foreground">Retkeilijän loki kuuluu kaikille</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Havaintoja voi lukea ja tehdä ilman tiliä. Kirjautuneena omat merkinnät säilyvät lisäksi profiilisi päiväkirjassa.</p>
        </div>
      </div>
    </div>
  )
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fi-FI", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value))
}
