import { ArrowRight } from 'lucide-react'
import { Reveal } from './reveal'
import { CompassMark } from './compass-mark'

export function FinalCta() {
  return (
    <section id="liity" className="relative overflow-hidden bg-forest text-forest-foreground">
      <div className="paper-grain absolute inset-0 opacity-40" />
      <CompassMark
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 text-brass/15 sm:-right-10"
      />
      <div className="relative mx-auto max-w-3xl px-5 py-28 text-center sm:px-8 sm:py-36">
        <Reveal>
          <h2 className="text-balance font-serif text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
            Lähde löytöretkelle.
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-forest-foreground/85 sm:text-xl">
            Löytöretki auttaa sinut oikeaan suuntaan, kun tiedät mitä etsit — ja
            antaa mahdollisuuden löytää jotain aivan muuta.
          </p>
        </Reveal>
        <Reveal delay={160}>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="#top"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-brass px-8 text-base font-semibold text-brass-foreground shadow-lg shadow-black/20 transition-transform hover:-translate-y-0.5"
            >
              Tutustu Löytöretkeen
              <ArrowRight className="h-5 w-5" />
            </a>
            <p className="text-sm text-forest-foreground/70">
              Löytöretki on tulossa. Ilmoitamme heti kun se on saatavilla.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
