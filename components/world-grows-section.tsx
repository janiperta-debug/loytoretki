import { MapPin, Map, Store, Recycle, BookMarked, Gavel, Users } from 'lucide-react'
import { Reveal } from './reveal'

const sources = [
  { label: 'OpenStreetMap', icon: Map },
  { label: 'Kirpputorit', icon: Store },
  { label: 'Kierrätyskeskukset', icon: Recycle },
  { label: 'Antikvariaatit', icon: BookMarked },
  { label: 'Huutokaupat', icon: Gavel },
  { label: 'Käyttäjähavainnot', icon: Users },
]

export function WorldGrowsSection() {
  return (
    <section
      id="tulevaisuus"
      className="paper-grain relative scroll-mt-20 bg-background"
    >
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-brass">
              Tulevaisuus
            </p>
            <h2 className="text-balance font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
              Yksi maailma. Monta lähdettä.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Löytöretki rakennetaan niin, että uudet tietolähteet voivat
              rikastaa samoja paikkoja ilman, että käyttäjän tarvitsee opetella
              uutta palvelua.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative mx-auto mt-16 max-w-3xl">
            {/* central place */}
            <div className="mx-auto flex w-fit flex-col items-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl border border-clay/30 bg-clay/12 text-clay shadow-sm">
                <MapPin className="h-9 w-9" />
              </span>
              <span className="mt-3 font-serif text-xl font-semibold text-foreground">
                Aarreaitta
              </span>
              <span className="text-sm text-muted-foreground">yksi paikka</span>
            </div>

            {/* orbiting sources */}
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {sources.map((s, i) => (
                <div
                  key={s.label}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  <s.icon className="h-5 w-5 shrink-0 text-forest" />
                  <span className="text-sm font-medium text-foreground">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Osa lähteistä tulee mukaan vasta tulevaisuudessa, kun uusia
              yhteyksiä rakennetaan.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
