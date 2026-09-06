import Image from "next/image"
import { MapPin, Plus, CalendarDays } from "lucide-react"
import { JOURNAL_ENTRIES } from "@/lib/loytoretki-data"

export default function PaivakirjaPage() {
  return (
    <div className="min-h-full">
      <header className="border-b border-border/70 bg-card/80 px-5 pb-4 pt-6 backdrop-blur">
        <h1 className="text-center font-serif text-lg font-semibold uppercase tracking-[0.12em] text-foreground">
          Retkipäiväkirja
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground text-balance">
          Löytösi, paikkasi ja tarinasi yhdessä paikassa.
        </p>
      </header>

      <div className="px-5 py-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {JOURNAL_ENTRIES.length} merkintää
          </span>
          <button className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-2 text-sm font-semibold text-forest-foreground shadow-md transition-transform active:scale-95">
            <Plus className="h-4 w-4" />
            Uusi merkintä
          </button>
        </div>

        <ol className="space-y-4">
          {JOURNAL_ENTRIES.map((entry, i) => (
            <li key={entry.id}>
              <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                {/* taped photo strip */}
                <div className="relative">
                  <div className="relative h-44 w-full">
                    <Image
                      src={entry.image || "/placeholder.svg"}
                      alt={entry.find}
                      fill
                      className="object-cover sepia-[0.15]"
                      sizes="480px"
                    />
                  </div>
                  <span className="absolute left-1/2 top-2 h-5 w-16 -translate-x-1/2 -rotate-2 rounded-[2px] bg-brass/25 backdrop-blur-[1px]" aria-hidden />
                  <span className="absolute right-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur tabular-nums">
                    #{JOURNAL_ENTRIES.length - i}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-brass" aria-hidden />
                      {entry.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-brass" aria-hidden />
                      {entry.place}
                    </span>
                  </div>

                  <h2 className="mt-2 font-serif text-xl font-semibold text-foreground text-balance">{entry.find}</h2>

                  <p className="mt-2 border-l-2 border-brass/40 pl-3 font-serif text-[15px] italic leading-relaxed text-foreground/90">
                    {entry.note}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center">
          <p className="font-serif text-base text-foreground">Jaa vinkkejä muille retkeilijöille</p>
          <p className="mt-1 text-sm text-muted-foreground text-balance">
            Merkitse muistettavat pöydät ja myyjät. Yhteisön havainnot tekevät kompassista tarkemman.
          </p>
        </div>
      </div>
    </div>
  )
}
