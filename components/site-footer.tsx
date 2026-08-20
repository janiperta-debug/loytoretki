import { CompassMark } from "./compass-mark"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/60">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <CompassMark className="h-8 w-8 text-brass" />
              <span className="font-serif text-lg font-semibold text-foreground">Löytöretki</span>
            </div>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
              Löydä enemmän. Elä vähemmän. Kartta paikkoihin, joissa etsimäsi jo odottaa — ja
              asioihin, joita et vielä tiennyt etsiväsi.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="Löytöretki"
              items={[
                { label: "Mikä se on", href: "#mika" },
                { label: "Miten toimii", href: "#miten" },
                { label: "Paikat", href: "#paikat" },
              ]}
            />
            <FooterCol
              title="Matka"
              items={[
                { label: "Tulevaisuus", href: "#tulevaisuus" },
                { label: "Liity mukaan", href: "#liity" },
              ]}
            />
            <FooterCol
              title="Lisää"
              items={[
                { label: "Tietosuoja", href: "#" },
                { label: "Yhteystiedot", href: "#" },
              ]}
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Löytöretki. Kaikki polut avoinna.</p>
          <p className="uppercase tracking-[0.18em]">Löydä enemmän. Elä vähemmän.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  items,
}: {
  title: string
  items: { label: string; href: string }[]
}) {
  return (
    <div>
      <h3 className="font-serif text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-brass"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
