"use client"

import { FormEvent, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Plus, CalendarDays, X, LogIn } from "lucide-react"
import { supabase } from "@/lib/supabase"

type Place = {
  id: string
  name: string
  city: string | null
}

type JournalEntry = {
  id: string
  title: string | null
  text: string
  entry_date: string
  place_id: string | null
  place: Place | null
}

export default function PaivakirjaPage() {
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [placeId, setPlaceId] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadJournal(currentUser = user) {
    if (!currentUser) {
      setEntries([])
      setLoading(false)
      return
    }

    const [{ data: entryData }, { data: placeData }] = await Promise.all([
      supabase
        .from("journal_entries")
        .select("id, title, text, entry_date, place_id, place:places(id, name, city)")
        .eq("user_id", currentUser.id)
        .order("entry_date", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("places")
        .select("id, name, city")
        .order("name", { ascending: true }),
    ])

    setEntries((entryData ?? []) as JournalEntry[])
    setPlaces(placeData ?? [])
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false

    async function init() {
      const { data } = await supabase.auth.getUser()
      if (cancelled) return
      setUser(data.user)
      await loadJournal(data.user)
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return
      setUser(session?.user ?? null)
      await loadJournal(session?.user ?? null)
    })

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || !text.trim()) return

    setSaving(true)
    setError(null)

    const { error: insertError } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      place_id: placeId || null,
      title: title.trim() || null,
      text: text.trim(),
    })

    if (insertError) {
      setError("Merkintää ei voitu tallentaa. Yritä uudelleen.")
      setSaving(false)
      return
    }

    setTitle("")
    setText("")
    setPlaceId("")
    setShowForm(false)
    setSaving(false)
    await loadJournal(user)
  }

  if (loading) {
    return <div className="grid min-h-full place-items-center bg-background"><p className="text-sm text-muted-foreground">Ladataan päiväkirjaa…</p></div>
  }

  if (!user) {
    return (
      <div className="min-h-full">
        <header className="border-b border-border/70 bg-card/80 px-5 pb-4 pt-6 backdrop-blur">
          <h1 className="text-center font-serif text-lg font-semibold uppercase tracking-[0.12em] text-foreground">Retkipäiväkirja</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground text-balance">Löytösi, paikkasi ja tarinasi yhdessä paikassa.</p>
        </header>
        <div className="px-5 py-8">
          <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-forest text-forest-foreground"><LogIn className="h-5 w-5" /></div>
            <h2 className="mt-4 font-serif text-xl font-semibold text-foreground">Oma päiväkirja tarvitsee tilin</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Kirjaudu sisään, niin voit tallentaa omat retkesi ja palata niihin myöhemmin.</p>
            <Link href="/sovellus/kirjaudu" className="mt-5 inline-flex items-center justify-center rounded-xl bg-forest px-5 py-3 font-semibold text-forest-foreground">Kirjaudu / Luo tili</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-border/70 bg-card/80 px-5 pb-4 pt-6 backdrop-blur">
        <h1 className="text-center font-serif text-lg font-semibold uppercase tracking-[0.12em] text-foreground">Retkipäiväkirja</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground text-balance">Löytösi, paikkasi ja tarinasi yhdessä paikassa.</p>
      </header>

      <div className="px-5 py-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{entries.length} merkintää</span>
          <button type="button" onClick={() => { setShowForm(true); setError(null) }} className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-2 text-sm font-semibold text-forest-foreground shadow-md transition-transform active:scale-95">
            <Plus className="h-4 w-4" />
            Uusi merkintä
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold">Uusi päiväkirjamerkintä</h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Sulje" className="grid h-8 w-8 place-items-center rounded-full bg-secondary"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <label className="block"><span className="mb-1.5 block text-sm font-medium">Otsikko <span className="font-normal text-muted-foreground">(valinnainen)</span></span><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-forest/20" placeholder="Esim. Hyvä kirppiskierros" /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-medium">Kohde <span className="font-normal text-muted-foreground">(valinnainen)</span></span><select value={placeId} onChange={(e) => setPlaceId(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-forest/20"><option value="">Valitse kohde…</option>{places.map((place) => <option key={place.id} value={place.id}>{place.name}{place.city ? ` · ${place.city}` : ""}</option>)}</select></label>
              <label className="block"><span className="mb-1.5 block text-sm font-medium">Merkintä</span><textarea required value={text} onChange={(e) => setText(e.target.value)} rows={5} className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-forest/20" placeholder="Mitä löysit, missä kävit tai mitä haluat muistaa?" /></label>
              {error && <p className="rounded-xl bg-clay/10 px-3 py-2.5 text-sm text-clay">{error}</p>}
              <button type="submit" disabled={saving || !text.trim()} className="w-full rounded-xl bg-forest px-4 py-3.5 font-semibold text-forest-foreground shadow-sm disabled:opacity-60">{saving ? "Tallennetaan…" : "Tallenna merkintä"}</button>
            </div>
          </form>
        )}

        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-7 text-center">
            <CalendarDays className="mx-auto h-7 w-7 text-brass" />
            <h2 className="mt-3 font-serif text-lg font-semibold text-foreground">Päiväkirjasi on vielä tyhjä</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Tallenna ensimmäinen merkintä, kun haluat muistaa retkesi ja löytösi.</p>
          </div>
        ) : (
          <ol className="space-y-4">
            {entries.map((entry, i) => (
              <li key={entry.id}>
                <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div className="relative h-44 w-full">
                    <Image src="/placeholder.svg" alt="" fill className="object-cover sepia-[0.15]" sizes="480px" />
                    <span className="absolute left-1/2 top-2 h-5 w-16 -translate-x-1/2 -rotate-2 rounded-[2px] bg-brass/25" aria-hidden />
                    <span className="absolute right-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur tabular-nums">#{entries.length - i}</span>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-brass" aria-hidden />{formatDate(entry.entry_date)}</span>
                      {entry.place && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-brass" aria-hidden />{entry.place.name}</span>}
                    </div>
                    <h2 className="mt-2 font-serif text-xl font-semibold text-foreground text-balance">{entry.title || "Päiväkirjamerkintä"}</h2>
                    <p className="mt-2 whitespace-pre-wrap border-l-2 border-brass/40 pl-3 font-serif text-[15px] italic leading-relaxed text-foreground/90">{entry.text}</p>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center">
          <p className="font-serif text-base text-foreground">Jaa vinkkejä muille retkeilijöille</p>
          <p className="mt-1 text-sm text-muted-foreground text-balance">Yhteisön havainnot tulevat mukaan myöhemmin ja tekevät kompassista tarkemman.</p>
        </div>
      </div>
    </div>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fi-FI", { day: "numeric", month: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`))
}
