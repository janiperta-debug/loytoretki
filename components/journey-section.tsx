import { Search, MapPin, ListChecks, Navigation, Footprints } from 'lucide-react'
import { Reveal } from './reveal'

const steps = [
  { icon: Search, title: 'Etsi', text: '”luistimet 31”' },
  { icon: MapPin, title: 'Löydä', text: 'Kolme kiinnostavaa paikkaa' },
  { icon: ListChecks, title: 'Valitse', text: 'Lisää paikat retkelle' },
  { icon: Navigation, title: 'Lähde', text: 'Navigoi paikasta toiseen' },
  { icon: Footprints, title: 'Löydä', text: 'Katso mitä löydät' },
]

export function JourneySection() {
  return (
    <section className="relative bg-forest text-forest-foreground">
      <div className="paper-grain absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <div className="max-w-2xl">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-brass">
              Retki
            </p>
            <h2 className="text-balance font-serif text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              Löydöstä retkeksi.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-forest-foreground/85">
              Löytöretki ei pääty sovelluksen sisään. Se johdattaa sinut takaisin
              todelliseen maailmaan.
            </p>
          </div>
        </Reveal>

        <ol className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {/* connecting dashed route on desktop */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-brass/40 lg:block"
          />
          {steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 80} className="relative">
              <div className="flex flex-col items-start gap-4 lg:items-center lg:text-center">
                <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-brass/40 bg-[oklch(0.34_0.045_152)] text-brass">
                  <step.icon className="h-6 w-6" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brass text-[11px] font-bold text-brass-foreground">
                    {i + 1}
                  </span>
                </span>
                <div>
                  <h3 className="font-serif text-xl font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-forest-foreground/75">
                    {step.text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
