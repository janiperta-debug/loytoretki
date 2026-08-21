import { Reveal } from './reveal'

export function ProblemSection() {
  return (
    <section id="mika" className="paper-grain relative scroll-mt-20 bg-background">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 sm:px-8 sm:py-32 md:grid-cols-2 md:items-center md:gap-16">
        <div>
        <Reveal>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-brass">
            Kun tiedät mitä etsit
          </p>
          <h2 className="text-balance font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
            Joskus tiedät tarkalleen, mitä etsit.
          </h2>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-8 border-l-2 border-brass/50 pl-6">
            <p className="font-serif text-2xl leading-snug text-foreground/90 sm:text-3xl">
              Tarvitset lapselle luistimet.
              <br />
              Tiedät koon.
              <br />
              <span className="text-brass">Et vain tiedä, missä niitä voisi olla.</span>
            </p>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="mt-10 space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>
              Kirpputoreilla ja muissa löytöpaikoissa tieto on hajallaan.
              Tuotteita ei ole aina helppo hakea, eikä kaikkea ole edes verkossa.
            </p>
            <p className="text-foreground">
              Lopputulos on usein sama: joko kierrät paikat yksi kerrallaan — tai
              ostat uutena.
            </p>
          </div>
        </Reveal>
        </div>

        <Reveal delay={100}>
          <figure className="relative overflow-hidden rounded-2xl border border-border shadow-xl shadow-black/10">
            <img
              src="/images/search-scene.jpg"
              alt="Muistikirja luonnoksineen, suurennuslasi, kompassi ja kartta, johon on merkitty reitti löytöpaikkojen välille"
              className="aspect-4/3 h-full w-full object-cover md:aspect-auto"
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brass/15" />
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
