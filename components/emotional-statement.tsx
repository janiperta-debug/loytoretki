import { Reveal } from './reveal'

export function EmotionalStatement() {
  return (
    <section className="relative bg-secondary/40">
      <div className="mx-auto max-w-4xl px-5 py-32 text-center sm:px-8 sm:py-44">
        <Reveal>
          <h2 className="text-balance font-serif text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl md:text-6xl">
            Kaikkea ei tarvitse löytää verkosta.
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mx-auto mt-8 max-w-xl text-pretty text-xl leading-relaxed text-muted-foreground sm:text-2xl">
            Joskus riittää, että tiedät mistä kannattaa aloittaa.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
