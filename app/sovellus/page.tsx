import Link from "next/link"
import type { ReactNode } from "react"
import {
  Compass,
  Search,
  MapPin,
  ChevronRight,
  Store,
  Recycle,
  Gavel,
  Landmark,
  Plus,
  NotebookPen,
  Lightbulb,
} from "lucide-react"
import { CompassMark } from "@/components/compass-mark"
import { NearbyPlaces } from "@/components/app/nearby-places"
import { ObservationForm } from "@/components/app/observation-form"
import { SOURCE_TYPES } from "@/lib/loytoretki-data"

export default function KotiPage() {
  return (
    <div>
      <HeroHeader />

      <section className="space-y-4 px-4 py-6">
        <NearbyPlaces />
        <ObservationForm />

        <InfoCard title="Kompassin periaatteet" icon={<CompassMark className="h-5 w-5 text-brass" aria-hidden />}>
          <p className="font-medium text-foreground">Ohjaa, ei lupaa.</p>
          <ul className="mt-2 space-y-1.5">
            <li className="flex gap-2">
              <span className="text-brass">✦</span>
              Tieto elää — paikka, tuote ja tilanne voivat muuttua.
            </li>
            <li className="flex gap-2">
              <span className="text-brass">✦</span>
              Yhteisön havainnot tekevät kompassista tarkemman.
            </li>
            <li className="flex gap-2">
              <span className="text-brass">✦</span>
              Löytöretki on apurisi, ei takauksesi.
            </li>
          </ul>
        </InfoCard>

        <Link href="/sovellus/paivakirja" className="block">
          <InfoCard
            title="Retkipäiväkirja"
            icon={<NotebookPen className="h-5 w-5 text-brass" aria-hidden />}
            action="Avaa päiväkirja"
          >
            <p>Tallenna löytösi, paikat ja tarinat. Merkitse muistettavat pöydät ja myyjät. Jaa vinkkejä muille retkeilijöille.</p>
          </InfoCard>
        </Link>

        <InfoCard title="Mukana useita lähteitä" icon={<Store className="h-5 w-5 text-brass" aria-hidden />}>
          <div className="mt-1 flex flex-wrap gap-2">
            {SOURCE_TYPES.map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground"
              >
                <SourceIcon name={s.icon} />
                {s.label}
              </span>
            ))}
          </div>
        </InfoCard>
      </section>
    </div>
  )
}

function HeroHeader() {
  return (
    <header className="relative overflow-hidden">
      <img
        src="/images/journey-scene.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.2_0.02_60_/_0.72)] via-[oklch(0.2_0.02_60_/_0.62)] to-[oklch(0.16_0.02_60_/_0.9)]" />
      <div className="relative px-5 pb-8 pt-12">
        <div className="flex items-center gap-3">
          <CompassMark className="h-11 w-11 text-brass" aria-hidden />
          <div>
            <h1 className="font-serif text-4xl font-semibold leading-none text-[oklch(0.96_0.02_88)]">
              Löytöretki
            </h1>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brass">
              Löydä enemmän. Elä vähemmän.
            </p>
          </div>
        </div>
        <p className="mt-6 max-w-[15rem] text-pretty font-serif text-xl leading-snug text-[oklch(0.94_0.02_88)]">
          Apuri löytämiseen. Se näyttää suunnan, ei lupaa.
        </p>
      </div>
    </header>
  )
}

function InfoCard({
  title,
  icon,
  children,
  action,
}: {
  title: string
  icon: ReactNode
  children: ReactNode
  action?: string
}) {
  return (
    <article className="paper-grain rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        {icon}
        <h2 className="font-serif text-lg font-semibold uppercase tracking-wide text-foreground">{title}</h2>
      </div>
      <div className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{children}</div>
      {action ? (
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-forest">
          {action}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      ) : null}
    </article>
  )
}

function SourceIcon({ name }: { name: string }) {
  const cls = "h-4 w-4 text-forest"
  if (name === "store") return <Store className={cls} strokeWidth={1.7} aria-hidden="true" />
  if (name === "recycle") return <Recycle className={cls} strokeWidth={1.7} aria-hidden="true" />
  if (name === "gavel") return <Gavel className={cls} strokeWidth={1.7} aria-hidden="true" />
  if (name === "landmark") return <Landmark className={cls} strokeWidth={1.7} aria-hidden="true" />
  return <Plus className={cls} strokeWidth={1.7} aria-hidden="true" />
}
