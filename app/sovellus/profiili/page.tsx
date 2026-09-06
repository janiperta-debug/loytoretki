import Link from "next/link"
import Image from "next/image"
import { Search, MapPin, Bookmark, Bell, ChevronRight, Settings, Compass } from "lucide-react"
import { PROFILE, getLocation, JOURNAL_ENTRIES, SCORE_META } from "@/lib/loytoretki-data"
import { ScoreDot } from "@/components/app/compass-bits"

export default function ProfiiliPage() {
  const savedLocations = PROFILE.savedLocationIds.map((id) => getLocation(id)).filter(Boolean)
  const savedFinds = PROFILE.savedFindIds
    .map((id) => JOURNAL_ENTRIES.find((e) => e.id === id))
    .filter(Boolean)

  return (
    <div className="min-h-full">
      <header className="relative overflow-hidden border-b border-border/70 bg-forest px-5 pb-6 pt-8 text-forest-foreground">
        <div className="paper-grain absolute inset-0 opacity-30" />
        <div className="relative flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 border-brass/50 bg-background/10">
            <Compass className="h-8 w-8 text-brass" strokeWidth={1.6} aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-semibold">{PROFILE.name}</h1>
            <p className="text-sm text-forest-foreground/80">{PROFILE.handle}</p>
            <p className="mt-0.5 text-xs text-forest-foreground/70">{PROFILE.memberSince}</p>
          </div>
          <button
            aria-label="Asetukset"
            className="ml-auto grid h-10 w-10 shrink-0 place-items-center self-start rounded-full bg-background/15 text-forest-foreground transition-transform active:scale-95"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        <dl className="relative mt-5 grid grid-cols-3 gap-2">
          {PROFILE.stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-background/10 px-2 py-3 text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-serif text-2xl font-semibold leading-none tabular-nums">{s.value}</dd>
              <p className="mt-1 text-xs text-forest-foreground/75">{s.label}</p>
            </div>
          ))}
        </dl>
      </header>

      <div className="space-y-6 px-5 py-6">
        <Section title="Tallennetut haut" icon={<Search className="h-4 w-4 text-brass" aria-hidden />}>
          <ul className="space-y-2">
            {PROFILE.savedSearches.map((s) => (
              <li key={s.term}>
                <Link
                  href="/sovellus/haku"
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm transition-transform active:scale-[0.99]"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-brass">
                    <Search className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{s.term}</p>
                    <p className="text-xs text-muted-foreground">Säde {s.radius}</p>
                  </div>
                  {s.fresh > 0 && (
                    <span className="rounded-full bg-clay/15 px-2 py-0.5 text-xs font-semibold text-clay tabular-nums">
                      {s.fresh} uutta
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Tallennetut kohteet" icon={<MapPin className="h-4 w-4 text-brass" aria-hidden />}>
          <ul className="space-y-2">
            {savedLocations.map((l) => (
              <li key={l!.id}>
                <Link
                  href={`/sovellus/kohde/${l!.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-transform active:scale-[0.99]"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                    <Image src={l!.image || "/placeholder.svg"} alt="" fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{l!.name}</p>
                    <p className="inline-flex items-center gap-1.5 text-xs" style={{ color: SCORE_META[l!.score].token }}>
                      <ScoreDot score={l!.score} className="h-1.5 w-1.5" />
                      {SCORE_META[l!.score].label}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {l!.distanceKm.toLocaleString("fi-FI")} km
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Tallennetut löydöt" icon={<Bookmark className="h-4 w-4 text-brass" aria-hidden />}>
          <ul className="grid grid-cols-2 gap-3">
            {savedFinds.map((f) => (
              <li key={f!.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="relative h-24 w-full">
                  <Image src={f!.image || "/placeholder.svg"} alt="" fill className="object-cover sepia-[0.15]" sizes="200px" />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-foreground">{f!.find}</p>
                  <p className="text-xs text-muted-foreground">{f!.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Asetukset" icon={<Bell className="h-4 w-4 text-brass" aria-hidden />}>
          <div className="divide-y divide-border rounded-xl border border-border bg-card shadow-sm">
            <ToggleRow label="Ilmoitukset tuoreista osumista" defaultOn />
            <ToggleRow label="Viikkokooste alueesi löydöistä" defaultOn />
            <ToggleRow label="Yhteisön havainnot mukaan arvioon" />
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2.5 flex items-center gap-2 font-serif text-base font-semibold text-foreground">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  )
}

function ToggleRow({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 p-3.5">
      <span className="text-sm text-foreground">{label}</span>
      <span className="relative inline-flex">
        <input type="checkbox" defaultChecked={defaultOn} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-secondary transition-colors peer-checked:bg-forest" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  )
}
