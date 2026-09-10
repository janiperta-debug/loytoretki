"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { Search, MapPin, Bookmark, ChevronRight, Compass, LogIn, LogOut, NotebookPen, Plus, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

type SavedPlace = {
  id: string
  place_id: string
  place: { id: string; name: string; category: string; city: string | null; description: string | null } | null
}
type SavedSearch = {
  id: string
  name: string
  created_at: string
}
type UserProfile = { display_name: string | null; username: string | null; avatar_url: string | null }
type JournalEntry = { id: string; title: string | null; text: string; entry_date: string; place_id: string | null; place: { id: string; name: string; city: string | null } | null }
type Place = { id: string; name: string; city: string | null }

export default function ProfiiliPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [observationsCount, setObservationsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showJournalForm, setShowJournalForm] = useState(false)
  const [journalTitle, setJournalTitle] = useState("")
  const [journalText, setJournalText] = useState("")
  const [journalPlaceId, setJournalPlaceId] = useState("")
  const [savingJournal, setSavingJournal] = useState(false)
  const [journalError, setJournalError] = useState<string | null>(null)

  async function load(currentUser: any) {
    if (!currentUser) {
      setUser(null); setProfile(null); setSavedPlaces([]); setSavedSearches([]); setJournalEntries([]); setObservationsCount(0); setLoading(false); return
    }
    setUser(currentUser)
    const [profileResult, savedResult, searchesResult, observationsResult, journalResult, placesResult] = await Promise.all([
      supabase.from("profiles").select("display_name, username, avatar_url").eq("id", currentUser.id).maybeSingle(),
      supabase.from("saved_places").select("id, place_id, place:places(id, name, category, city, description)").eq("user_id", currentUser.id).order("created_at", { ascending: false }),
      supabase.from("searches").select("id, name, created_at").eq("user_id", currentUser.id).order("created_at", { ascending: false }),
      supabase.from("observations").select("id", { count: "exact", head: true }).eq("user_id", currentUser.id),
      supabase.from("journal_entries").select("id, title, text, entry_date, place_id, place:places(id, name, city)").eq("user_id", currentUser.id).order("entry_date", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("places").select("id, name, city").order("name", { ascending: true }),
    ])
    setProfile(profileResult.data ?? null)
    setSavedPlaces(savedResult.error ? [] : ((savedResult.data ?? []) as SavedPlace[]))
    setSavedSearches(searchesResult.error ? [] : ((searchesResult.data ?? []) as SavedSearch[]))
    setObservationsCount(observationsResult.count ?? 0)
    setJournalEntries(journalResult.error ? [] : ((journalResult.data ?? []) as JournalEntry[]))
    setPlaces(placesResult.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false
    async function init() {
      const { data } = await supabase.auth.getUser()
      if (!cancelled) await load(data.user)
    }
    init()
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!cancelled) await load(session?.user ?? null)
    })
    return () => { cancelled = true; listener.subscription.unsubscribe() }
  }, [])

  async function logout() { await supabase.auth.signOut() }

  async function saveJournal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || !journalText.trim()) return
    setSavingJournal(true); setJournalError(null)
    const { error } = await supabase.from("journal_entries").insert({ user_id: user.id, place_id: journalPlaceId || null, title: journalTitle.trim() || null, text: journalText.trim() })
    if (error) { setJournalError("Merkintää ei voitu tallentaa. Yritä uudelleen."); setSavingJournal(false); return }
    setJournalTitle(""); setJournalText(""); setJournalPlaceId(""); setShowJournalForm(false); setSavingJournal(false)
    await load(user)
  }

  if (loading) return <div className="grid min-h-full place-items-center bg-background"><p className="text-sm text-muted-foreground">Ladataan profiilia…</p></div>

  if (!user) return (
    <div className="min-h-full">
      <header className="relative overflow-hidden border-b border-border/70 bg-forest px-5 pb-6 pt-8 text-forest-foreground">
        <div className="paper-grain absolute inset-0 opacity-30" />
        <div className="relative flex items-center gap-4"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-brass/50 bg-background/10"><Compass className="h-8 w-8 text-brass" strokeWidth={1.6} /></div><div className="min-w-0"><h1 className="font-serif text-2xl font-semibold">Oma Löytöretkesi</h1><p className="text-sm text-forest-foreground/80">Kirjaudu sisään tai luo tili</p><p className="mt-0.5 text-xs text-forest-foreground/70">Löytöretkeä voi käyttää myös ilman tiliä</p></div></div>
        <Link href="/sovellus/kirjaudu" className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-background px-4 py-3.5 font-semibold text-forest shadow-sm"><LogIn className="h-5 w-5" />Kirjaudu / Luo tili</Link>
      </header>
      <div className="space-y-6 px-5 py-6"><Section title="Oma päiväkirja" icon={<NotebookPen className="h-4 w-4 text-brass" />}><div className="rounded-xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">Kirjaudu sisään, niin voit säilyttää omat retkesi ja merkintäsi profiilissasi.</div></Section></div>
    </div>
  )

  const displayName = profile?.display_name || user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "Löytöretkeilijä"
  const handle = profile?.username ? `@${profile.username}` : user.email || ""

  return (
    <div className="min-h-full">
      <header className="relative overflow-hidden border-b border-border/70 bg-forest px-5 pb-6 pt-8 text-forest-foreground">
        <div className="paper-grain absolute inset-0 opacity-30" />
        <div className="relative flex items-center gap-4"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-brass/50 bg-background/10"><Compass className="h-8 w-8 text-brass" strokeWidth={1.6} /></div><div className="min-w-0"><h1 className="font-serif text-2xl font-semibold">{displayName}</h1><p className="truncate text-sm text-forest-foreground/80">{handle}</p><p className="mt-0.5 text-xs text-forest-foreground/70">Oma Löytöretkesi</p></div><button type="button" aria-label="Kirjaudu ulos" onClick={logout} className="ml-auto grid h-10 w-10 shrink-0 place-items-center self-start rounded-full bg-background/15 text-forest-foreground active:scale-95"><LogOut className="h-5 w-5" /></button></div>
        <dl className="relative mt-5 grid grid-cols-3 gap-2"><Stat value={observationsCount} label="Löytöä" /><Stat value={journalEntries.length} label="Retkeä" /><Stat value={savedPlaces.length} label="Kohdetta" /></dl>
      </header>

      <div className="space-y-6 px-5 py-6">
        <Section title="Tallennetut haut" icon={<Search className="h-4 w-4 text-brass" />}>
          {savedSearches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">Et ole vielä tallentanut hakuja.</div>
          ) : (
            <ul className="space-y-2">
              {savedSearches.map((search) => (
                <li key={search.id}>
                  <Link href={`/sovellus/haku?q=${encodeURIComponent(search.name)}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm active:scale-[0.99]">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-secondary"><Search className="h-5 w-5 text-brass" /></div>
                    <div className="min-w-0 flex-1"><p className="truncate font-medium text-foreground">{search.name}</p><p className="text-xs text-muted-foreground">Avaa haku uudelleen</p></div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Tallennetut kohteet" icon={<MapPin className="h-4 w-4 text-brass" />}>
          {savedPlaces.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">Et ole vielä tallentanut kohteita.</div> : <ul className="space-y-2">{savedPlaces.map((saved) => { const place = saved.place; if (!place) return null; return <li key={saved.id}><Link href={`/sovellus/kohde/${place.id}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm active:scale-[0.99]"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-secondary"><MapPin className="h-5 w-5 text-brass" /></div><div className="min-w-0 flex-1"><p className="truncate font-medium text-foreground">{place.name}</p><p className="text-xs text-muted-foreground">{place.category}{place.city ? ` · ${place.city}` : ""}</p></div><ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" /></Link></li> })}</ul>}
        </Section>

        <Section title="Oma päiväkirja" icon={<NotebookPen className="h-4 w-4 text-brass" />}>
          <div id="oma-paivakirja" className="space-y-3">
            <button type="button" onClick={() => { setShowJournalForm(true); setJournalError(null) }} className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-2 text-sm font-semibold text-forest-foreground shadow-md active:scale-95"><Plus className="h-4 w-4" />Uusi merkintä</button>
            {showJournalForm && <form onSubmit={saveJournal} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h3 className="font-serif text-lg font-semibold">Uusi merkintä</h3><button type="button" onClick={() => setShowJournalForm(false)} aria-label="Sulje" className="grid h-8 w-8 place-items-center rounded-full bg-secondary"><X className="h-4 w-4" /></button></div><div className="space-y-3"><input value={journalTitle} onChange={(e) => setJournalTitle(e.target.value)} placeholder="Otsikko (valinnainen)" className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-forest/20" /><select value={journalPlaceId} onChange={(e) => setJournalPlaceId(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-forest/20"><option value="">Kohde (valinnainen)</option>{places.map((place) => <option key={place.id} value={place.id}>{place.name}{place.city ? ` · ${place.city}` : ""}</option>)}</select><textarea required value={journalText} onChange={(e) => setJournalText(e.target.value)} rows={4} placeholder="Mitä haluat muistaa retkestäsi?" className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-forest/20" />{journalError && <p className="text-sm text-destructive">{journalError}</p>}<button type="submit" disabled={savingJournal || !journalText.trim()} className="w-full rounded-xl bg-forest px-4 py-3 font-semibold text-forest-foreground disabled:opacity-60">{savingJournal ? "Tallennetaan…" : "Tallenna merkintä"}</button></div></form>}
            {journalEntries.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">Oma päiväkirjasi on vielä tyhjä.</div> : <ol className="space-y-3">{journalEntries.map((entry) => <li key={entry.id} className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"><span>{formatDate(entry.entry_date)}</span>{entry.place && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-brass" />{entry.place.name}</span>}</div><h3 className="mt-2 font-serif text-lg font-semibold text-foreground">{entry.title || "Päiväkirjamerkintä"}</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground/90">{entry.text}</p></li>)}</ol>}
          </div>
        </Section>

        <Section title="Tallennetut haut ja löydöt" icon={<Bookmark className="h-4 w-4 text-brass" />}><div className="rounded-xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">Muut henkilökohtaiset tallennukset tulevat tähän myöhemmin.</div></Section>

        <Section title="Asetukset" icon={<LogOut className="h-4 w-4 text-brass" />}>
          <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            <Link href="/sovellus/legal" className="flex items-center justify-between text-sm font-medium text-foreground"><span>Tietosuoja ja käyttöehdot</span><ChevronRight className="h-4 w-4 text-muted-foreground" /></Link>
            <button type="button" onClick={logout} className="flex w-full items-center gap-3 border-t border-border pt-3 text-left text-sm font-medium text-foreground"><LogOut className="h-4 w-4 text-brass" />Kirjaudu ulos</button>
          </div>
        </Section>
      </div>
    </div>
  )
}

function formatDate(value: string) { return new Intl.DateTimeFormat("fi-FI", { day: "numeric", month: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`)) }
function Stat({ value, label }: { value: number; label: string }) { return <div className="rounded-xl bg-background/10 px-2 py-3 text-center"><dt className="sr-only">{label}</dt><dd className="font-serif text-2xl font-semibold leading-none tabular-nums">{value}</dd><p className="mt-1 text-xs text-forest-foreground/75">{label}</p></div> }
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) { return <section><h2 className="mb-2.5 flex items-center gap-2 font-serif text-base font-semibold text-foreground">{icon}{title}</h2>{children}</section> }
