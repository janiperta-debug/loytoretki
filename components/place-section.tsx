import { MapPin, Baby, BookMarked, Disc3, Gamepad2 } from 'lucide-react'
import { Reveal } from './reveal'

const categories = [
  { label: 'Lasten tavarat', icon: Baby },
  { label: 'Kirjat', icon: BookMarked },
  { label: 'Levyt', icon: Disc3 },
  { label: 'Pelit', icon: Gamepad2 },
]

export function PlaceSection() {
  return (
    <section className="relative bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 sm:px-8 sm:py-32 md:grid-cols-2 md:items-center">
        <Reveal>
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-brass">
              Paikka
            </p>
            <h2 className="text-balance font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
              Yksi paikka. Monta tietolähdettä.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Löytöretki kokoaa samaan paikkaan sijainnin, kategoriat,
              ajankohtaiset signaalit ja myöhemmin myös eri kumppaneiden sekä
              käyttäjien tuottamaa tietoa.
            </p>
          </div>
        </Reveal>

        {/* Place card */}
        <Reveal delay={120}>
          <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5">
            <div className="flex items-start gap-4 border-b border-border p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-clay/15 text-clay">
                <MapPin className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-serif text-2xl font-semibold text-foreground">
                  Aarreaitta
                </h3>
                <p className="text-sm text-muted-foreground">Kirpputori · 1,2 km</p>
              </div>
            </div>

            <div className="p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mitä täältä voisi löytyä
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <span
                    key={c.label}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-foreground"
                  >
                    <c.icon className="h-4 w-4 text-forest" />
                    {c.label}
                  </span>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-forest/25 bg-forest/8 p-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-forest" />
                  </span>
                  <span className="text-sm font-semibold text-forest">
                    Tuore havainto
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-foreground">
                  Lasten luistimia havaittu tänään
                </p>
              </div>

              <p className="mt-4 text-xs italic text-muted-foreground">
                Saatavuus voi muuttua nopeasti.
              </p>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  )
}
