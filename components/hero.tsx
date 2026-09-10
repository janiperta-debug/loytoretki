import { ArrowRight, Play } from 'lucide-react'

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* Background expedition image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-expedition.jpg"
          alt="Vanha kartta, kompassi, kaukoputki ja kirjoja puisella pöydällä lyhdyn valossa"
          className="h-full w-full object-cover object-center"
        />
        {/* Warm cinematic gradient, darkest on the left where the text sits */}
        <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.16_0.03_55_/_0.92)] via-[oklch(0.18_0.03_55_/_0.6)] to-[oklch(0.2_0.03_55_/_0.15)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.03_55_/_0.7)] via-transparent to-[oklch(0.14_0.03_55_/_0.35)]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-5 pt-28 pb-20 sm:px-8 sm:pt-32">
        <div className="max-w-2xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-brass/40 bg-[oklch(0.16_0.03_55_/_0.4)] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-brass backdrop-blur-sm">
            Löydä enemmän. Etsi vähemmän.
          </span>

          <h1 className="text-balance font-serif text-5xl font-semibold leading-[0.98] text-background sm:text-6xl md:text-7xl">
            Löydä enemmän.
            <br />
            Etsi vähemmän.
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-background/85 sm:text-xl">
            Löytöretki auttaa löytämään paikkoja, joissa etsimäsi voisi olla — ja
            asioita, joita et vielä tiennyt etsiväsi.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#liity"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-forest px-7 text-base font-semibold text-forest-foreground shadow-lg shadow-black/20 ring-1 ring-brass/30 transition-transform hover:-translate-y-0.5"
            >
              Tutustu Löytöretkeen
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#miten"
              className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-brass/50 bg-[oklch(0.16_0.03_55_/_0.35)] px-7 text-base font-semibold text-background backdrop-blur-sm transition-colors hover:bg-[oklch(0.16_0.03_55_/_0.55)]"
            >
              <Play className="h-4 w-4 fill-current" />
              Miten se toimii?
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
