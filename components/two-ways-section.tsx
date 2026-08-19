import { Search, Compass, MapPin, ArrowRight } from 'lucide-react'
import { Reveal } from './reveal'

export function TwoWaysSection() {
  return (
    <section id="miten" className="paper-grain relative scroll-mt-20 bg-background">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-brass">
              Kaksi tapaa
            </p>
            <h2 className="text-balance font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
              Kaksi tapaa käyttää Löytöretkeä
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Etsiminen ja löytäminen ovat yhtä tärkeitä osia — riippuen siitä,
              tiedätkö jo mitä haluat.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {/* SEARCH */}
          <Reveal delay={60}>
            <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-9">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest/10 text-forest">
                <Search className="h-6 w-6" />
              </span>
              <h3 className="mt-6 font-serif text-2xl font-semibold text-foreground">
                Tiedät mitä etsit.
              </h3>

              <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="font-medium text-foreground">luistimet 31</span>
                <span className="ml-auto text-xs uppercase tracking-wider text-brass">
                  Haku
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {['Aarreaitta · 1,2 km', 'Kierrätyskeskus · 1,8 km', 'Vintage Nurkka · 2,4 km'].map(
                  (r) => (
                    <div
                      key={r}
                      className="flex items-center gap-3 rounded-lg bg-secondary/60 px-4 py-3 text-sm text-secondary-foreground"
                    >
                      <MapPin className="h-4 w-4 text-forest" />
                      {r}
                      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </div>
                  ),
                )}
              </div>

              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                Löytöretki etsii paikkoja, joissa etsimäsi voisi olla.
              </p>
            </div>
          </Reveal>

          {/* DISCOVER */}
          <Reveal delay={140}>
            <div className="flex h-full flex-col rounded-2xl border border-brass/30 bg-[oklch(0.92_0.03_82)] p-7 shadow-sm sm:p-9">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brass/20 text-brass">
                <Compass className="h-6 w-6" />
              </span>
              <h3 className="mt-6 font-serif text-2xl font-semibold text-foreground">
                Haluat vain löytää.
              </h3>

              <div className="mt-6 flex items-center gap-3 rounded-xl border border-brass/30 bg-background/70 px-4 py-3.5">
                <Compass className="h-5 w-5 shrink-0 text-brass" />
                <span className="font-medium text-foreground">Mitä täällä voisi olla?</span>
              </div>

              <div className="relative mt-4 flex-1 overflow-hidden rounded-xl border border-brass/25 bg-[oklch(0.88_0.035_80)]">
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      'radial-gradient(oklch(0.4 0.055 152 / 0.25) 1px, transparent 1.5px), radial-gradient(oklch(0.5 0.11 40 / 0.2) 1px, transparent 1.5px)',
                    backgroundSize: '22px 22px, 30px 30px',
                    backgroundPosition: '0 0, 11px 11px',
                  }}
                />
                <div className="relative flex min-h-44 items-center justify-center p-6">
                  <MapPin className="absolute left-[18%] top-[24%] h-6 w-6 text-clay" />
                  <MapPin className="absolute right-[22%] top-[32%] h-6 w-6 text-forest" />
                  <MapPin className="absolute bottom-[24%] left-[38%] h-6 w-6 text-brass" />
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brass text-brass-foreground shadow-md ring-4 ring-brass/25">
                    <Compass className="h-6 w-6" />
                  </span>
                </div>
              </div>

              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                Tutki ympäristöä ja löydä paikkoja, joita et olisi muuten
                huomannut.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
