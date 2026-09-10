"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, MapPin, Bookmark, Bell, ChevronRight, Settings, Compass, LogIn, LogOut } from "lucide-react"
import { PROFILE, JOURNAL_ENTRIES } from "@/lib/loytoretki-data"
import { supabase } from "@/lib/supabase"

type SavedPlace = {
  id: string
  place_id: string
  place: { id: string; name: string; category: string; city: string | null; description: string | null } | null
}
type UserProfile = { display_name: string | null; username: string | null; avatar_url: string | null }

export default function ProfiiliPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([])
  const [observationsCount, setObservationsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (cancelled) return
      if (!userData.user) {
        setUser(null); setProfile(null); setSavedPlaces([]); setObservationsCount(0); setLoading(false); return
      }
      setUser(userData.user)
      const [profileResult, savedResult, observationsResult] = await Promise.all([
        supabase.from("profiles").select("display_name, username, avatar_url").eq("id", userData.user.id).maybeSingle(),
        supabase.from("saved_places").select("id, place_id, place:places(id, name, category, city, description)").eq("user_id", userData.user.id).order("created_at", { ascending: false }),
        supabase.from("observations").select("id", { count: "exact", head: true }).eq("user_id", userData.user.id),
      ])
      if (cancelled) return
      setProfile(profileResult.data ?? null)
      setSavedPlaces(savedResult.error ? [] : ((savedResult.data ?? []) as SavedPlace[]))
      setObservationsCount(observationsResult.count ?? 0)
      setLoading(false)
    }
    load()
    const { data: listener } = supabase.auth.onAuthStateChange(() => load())
    return () => { cancelled = true; listener.subscription.unsubscribe() }
  }, [])

  async function logout() { await supabase.auth.signOut() }

  if (loading) return <div className="grid min-h-full place-items-center bg-background"><p className="text-sm text-muted-foreground">Ladataan profiilia…</p></div>

  if (!user) return (
    <div className="min-h-full">
      <header className="relative overflow-hidden border-b border-border/70 bg-forest px-5 pb-6 pt-8 text-forest-foreground">
        <div className="paper-grain absolute inset-0 opacity-30" />
        <div className="relative flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-brass/50 bg-background/10"><Compass className="h-8 w-8 text-brass" strokeWidth={1.6} /></div>
          <div className="min-w-0"><h1 className="font-serif text-2xl font-semibold">Oma Löytöretkesi</h1><p className="text-sm text-forest-foreground/80">Kirjaudu sisään tai luo tili</p><p className="mt-0.5 text-xs text-forest-foreground/70">Löytöretkeä voi käyttää myös ilman tiliä</p></div>
        </div>
        <Link href="/sovellus/kirjaudu" className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-background px-4 py-3.5 font-semibold text-forest shadow-sm active:scale-[0.99]"><LogIn className="h-5 w-5" />Kirjaudu / Luo tili</Link>
      </header>
      <div className="space-y-6 px-5 py-6">
        <Section title="Tallennetut kohteet" icon={<MapPin className="h-4 w-4 text-brass" />}><div className="rounded-xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">Kirjaudu sisään tallentaaksesi kohteita omaan profiiliisi.</div></Section>
      </div>
    </div>
  )

  const displayName = profile?.display_name || user.user_metadata?.full_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "Löytöretkeilijä"
  const handle = profile?.username ? `@${profile.username}` : user.email || ""

  return (
    <div className="min-h-full">
      <header className="relative overflow-hidden border-b border-border/70 bg-forest px-5 pb-6 pt-8 text-forest-foreground">
        <div className="paper-grain absolute inset-0 opacity-30" />
        <div className="relative flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-brass/50 bg-background/10"><Compass className="h-8 w-8 text-brass" strokeWidth={1.6} /></div>
          <div className="min-w-0"><h1 className="font-serif text-2xl font-semibold">{displayName}</h1><p className="truncate text-sm text-forest-foreground/80">{handle}</p><p className="mt-0.5 text-xs text-forest-foreground/70">Oma Löytöretkesi</p></div>
          <button type="button" aria-label="Kirjaudu ulos" onClick={logout} className="ml-auto grid h-10 w-10 shrink-0 place-items-center self-start rounded-full bg-background/15 text-forest-foreground active:scale-95"><LogOut className="h-5 w-5" /></button>
        </div>
        <dl className="relative mt-5 grid grid-cols-3 gap-2"><Stat value={observationsCount} label="Löytöä" /><Stat value={0} label="Retkeä" /><Stat value={savedPlaces.length} label="Kohdetta" /></dl>
      </header>
      <div className="space-y-6 px-5 py-6">
        <Section title="Tallennetut haut" icon={<Search className="h-4 w-4 text-brass" />}><div className="rounded-xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">Et ole vielä tallentanut hakuja.</div></Section>
        <Section title="Tallennetut kohteet" icon={<MapPin className="h-4 w-4 text-brass" />}>
          {savedPlaces.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">Et ole vielä tallentanut kohteita.</div> : <ul className="space-y-2">{savedPlaces.map((saved) => { const place = saved.place; if (!place) return null; return <li key={saved.id}><Link href={`/sovellus/kohde/${place.id}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm active:scale-[0.99]"><div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-secondary"><Image src="/placeholder.svg" alt="" fill className="object-cover opacity-60" sizes="48px" /><MapPin className="relative h-5 w-5 text-brass" /></div><div className="min-w-0 flex-1"><p className="truncate font-medium text-foreground">{place.name}</p><p className="text-xs text-muted-foreground">{place.category}{place.city ? ` · ${place.city}` : ""}</p></div><ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" /></Link></li> })}</ul>}
        </Section>
        <Section title="Tallennetut löydöt" icon={<Bookmark className="h-4 w-4 text-brass" />}><div className="rounded-xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">Löytöhistoria tulee tähän, kun päiväkirjan omat tallennukset ovat käytössä.</div></Section>
        <Section title="Asetukset" icon={<Bell className="h-4 w-4 text-brass" />}><div className="rounded-xl border border-border bg-card p-4 shadow-sm"><button type="button" onClick={logout} className="flex w-full items-center gap-3 text-left text-sm font-medium text-foreground"><LogOut className="h-4 w-4 text-brass" />Kirjaudu ulos</button></div></Section>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) { return <div className="rounded-xl bg-background/10 px-2 py-3 text-center"><dt className="sr-only">{label}</dt><dd className="font-serif text-2xl font-semibold leading-none tabular-nums">{value}</dd><p className="mt-1 text-xs text-forest-foreground/75">{label}</p></div> }
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) { return <section><h2 className="mb-2.5 flex items-center gap-2 font-serif text-base font-semibold text-foreground">{icon}{title}</h2>{children}</section> }
