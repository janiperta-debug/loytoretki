import { Reveal } from './reveal'

export function NotAStoreSection() {
  return (
    <section className="paper-grain relative bg-background">
      <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-brass">
            Rehellisyys
          </p>
          <h2 className="text-balance font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
            Löytöretki ei lupaa, että tuote odottaa sinua hyllyssä.
          </h2>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p className="text-foreground">Kirpputori ei ole verkkokauppa.</p>
            <p>
              Tuote voi olla jo myyty, siirtynyt toiseen pöytään tai kuvattu eri
              nimellä.
            </p>
            <p>
              Siksi Löytöretki ei lupaa varmaa saatavuutta. Se kertoo, missä
              kannattaa käydä katsomassa.
            </p>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <blockquote className="relative mt-12 rounded-2xl border border-brass/30 bg-[oklch(0.91_0.03_82)] p-8 sm:p-10">
            <span
              aria-hidden="true"
              className="absolute -top-4 left-8 font-serif text-6xl leading-none text-brass/50"
            >
              &ldquo;
            </span>
            <p className="text-balance font-serif text-2xl font-medium leading-snug text-foreground sm:text-3xl">
              Oikea maailma on epävarma. Löytöretki auttaa suunnistamaan siinä.
            </p>
          </blockquote>
        </Reveal>
      </div>
    </section>
  )
}
