import { MapPin } from 'lucide-react'
import { Reveal } from './reveal'

const places = [
  { name: 'Kirpputori', distance: '800 m' },
  { name: 'Antikvariaatti', distance: '1,2 km' },
  { name: 'Kierrätyskeskus', distance: '1,8 km' },
  { name: 'Vintage-liike', distance: '2,1 km' },
]

export function DiscoverySection() {
  return (
    <section className="relative bg-forest text-forest-foreground">
      <div className="paper-grain absolute inset-0 opacity-40" />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-5 py-24 sm:px-8 sm:py-32 md:grid-cols-2 md:items-center">
        <Reveal>
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-brass">
              Kun et etsi mitään erityistä
            </p>
            <h2 className="text-balance font-serif text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              Ja joskus et etsi mitään erityistä.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-forest-foreground/80">
              Haluat vain nähdä, mitä ympäriltä voisi löytyä.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-forest-foreground/90">
              Löytöretki tekee ympärillä olevista löytöpaikoista näkyviä.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <ul className="flex flex-col gap-3">
            {places.map((place, i) => (
              <li
                key={place.name}
                className="flex items-center gap-4 rounded-xl border border-brass/25 bg-[oklch(0.34_0.045_152)] px-5 py-4 transition-transform hover:translate-x-1"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass/15 text-brass">
                  <MapPin className="h-5 w-5" />
                </span>
                <span className="font-serif text-xl font-medium">{place.name}</span>
                <span className="ml-auto text-sm font-medium tabular-nums text-forest-foreground/70">
                  {place.distance}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
