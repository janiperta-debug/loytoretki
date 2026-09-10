"use client"

import { FormEvent, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { CalendarDays, MapPin, Plus, X, LogIn } from "lucide-react"
import { supabase } from "@/lib/supabase"

type LogEntry = {
  id: string
  entry_date: string
  title: string
  find: string | null
  note: string
  image_url: string | null
  place_name: string | null
  place: { id: string; name: string; city: string | null } | null
}

type Place = { id: string; name: string; city: string | null }

export default function RetkeilijanLokiPage() {
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [find, setFind] = useState("")
  const [note, setNote] = useState("")
  const [placeId, setPlaceId] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const [{ data: entryData }, { data: placeData }, { data: userData }] = await Promise.all([
      supabase.from("retkeilijan_loki").select("id, entry_date, title, find, note, image_url, place_name, place:places(id, name, city)").order("entry_date", { ascending: false }).order("created_at", { ascending: false }).limit(50),
      supabase.from("places").select("id, name, city").order("name", { ascending: true }),
      supabase.auth.getUser(),
    ])
    setEntries((entryData ?? []) as LogEntry[])
    setPlaces(placeData ?? [])
    setUser(userData.user)
    setLoading(false)
  }

  useEffect(() => {
    load()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => listener.subscription.unsubscribe()
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || !title.trim() || !note.trim()) return
    setSaving(true)
    setError(null)
    const place = places.find((item) => item.id === placeId)
    const { error: insertError } = await supabase.from("retkeilijan_loki").insert({
      user_id: user.id,
      place_id: placeId || null,
      place_name: place?.name ?? null,
      title: title.trim(),
      find: find.trim() || null,
      note: note.trim(),
      entry_date: new Date().toISOString().slice(0, 10),
      image_url: null,
    })
    if (insertError) {
      setError("Merkintää ei voitu tallentaa. Yritä uudelleen.")
      setSaving(false)
      return
    }
    setTitle(""); setFind(""); setNote(""); setPlaceId(""); setShowForm(false); setSaving(false)
    await load()
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-border/70 bg-card/80 px-5 pb-4 pt-6 backdrop-blur">
        <h1 className="text-center font-serif text-lg font-semibold uppercase tracking-[0.12em] text-foreground">Retkeilijän loki</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground text-balance">Löytöretkeilijöiden yhteinen paikka muistoille ja löydöille.</p>
      </header>

      <div className="px-5 py-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{entries.length} merkintää</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Kaikille avoin yhteinen loki.</p>
          </div>
          {user ? (
            <button type="button" onClick={() => { setShowForm(true); setError(null) }} className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-2 text-sm font-semibold text-forest-foreground shadow-md active:scale-95"><Plus className="h-4 w-4" />Jätä merkintä</button>
          ) : (
            <Link href="/sovellus/kirjaudu" className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-2 text-sm font-semibold text-forest-foreground shadow-md"><LogIn className="h-4 w-4" />Kirjaudu ja kirjoita</Link>
          )}
        </div>

        {showForm && (
          <form onSubmit={submit} className="mb-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-lg font-semibold">Uusi lokimerkintä</h2><button type="button" onClick={() => setShowForm(false)} aria-label="Sulje" className="grid h-8 w-8 place-items-center rounded-full bg-secondary"><X className="h-4 w-4" /></button></div>
            <div className="space-y-3">
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Otsikko" className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-forest/20" />
              <select value={placeId} onChange={(e) => setPlaceId(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-forest/20"><option value="">Kohde (valinnainen)</option>{places.map((place) => <option key={place.id} value={place.id}>{place.name}{place.city ? ` · ${place.city}` : ""}</option>)}</select>
              <input value={find} onChange={(e) => setFind(e.target.value)} placeholder="Mitä löysit? (valinnainen)" className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-forest/20" />
              <textarea required value={note} onChange={(e) => setNote(e.target.value)} rows={5} placeholder="Kerro retkestäsi tai löydöstäsi…" className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-forest/20" />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={saving || !title.trim() || !note.trim()} className="w-full rounded-xl bg-forest px-4 py-3 font-semibold text-forest-foreground disabled:opacity-60">{saving ? "Tallennetaan…" : "Julkaise lokiin"}</button>
            </div>
          </form>
        )}

        {loading ? <div className="rounded-2xl border border-dashed border-border bg-card/60 p-7 text-center text-sm text-muted-foreground">Ladataan lokia…</div> : entries.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-card/60 p-7 text-center"><p className="font-serif text-lg font-semibold">Loki on vielä tyhjä</p><p className="mt-1 text-sm text-muted-foreground">Ole ensimmäinen ja jätä oma merkintä.</p></div> : <ol className="space-y-5">{entries.map((entry, i) => <li key={entry.id}><article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="relative h-48 w-full bg-secondary">{entry.image_url ? <Image src={entry.image_url} alt="" fill className="object-cover" sizes="480px" /> : <div className="absolute inset-0 grid place-items-center opacity-25"><MapPin className="h-14 w-14 text-brass" /></div>}<span className="absolute left-1/2 top-2 h-5 w-16 -translate-x-1/2 -rotate-2 rounded-[2px] bg-brass/25" aria-hidden /><span className="absolute right-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur">#{entries.length - i}</span></div><div className="p-5"><div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-brass" />{formatDate(entry.entry_date)}</span>{(entry.place?.name || entry.place_name) && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-brass" />{entry.place?.name || entry.place_name}</span>}</div><h2 className="mt-2 font-serif text-xl font-semibold text-foreground">{entry.title}</h2>{entry.find && <p className="mt-1 font-serif text-base font-medium text-foreground/90">{entry.find}</p>}<p className="mt-2 border-l-2 border-brass/40 pl-3 font-serif text-[15px] italic leading-relaxed text-foreground/90">{entry.note}</p></div></article></li>)}</ol>}

        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center"><p className="font-serif text-base text-foreground">Retkeilijän loki kuuluu kaikille</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Lue muiden retkeilijöiden tarinoita tai kirjaudu sisään ja jätä oma merkintä. Havainnot pysyvät edelleen erillisenä ominaisuutena.</p></div>
      </div>
    </div>
  )
}

function formatDate(value: string) { return new Intl.DateTimeFormat("fi-FI", { day: "numeric", month: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`)) }
