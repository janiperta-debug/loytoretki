type CompassMarkProps = {
  className?: string
}

/** Simple engraved compass-rose mark used as the Löytöretki logo glyph. */
export function CompassMark({ className }: CompassMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Löytöretki-kompassi"
      fill="none"
      stroke="currentColor"
    >
      <circle cx="50" cy="50" r="46" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="38" strokeWidth="1" opacity="0.5" />
      {/* four-point star */}
      <path
        d="M50 10 L57 43 L90 50 L57 57 L50 90 L43 57 L10 50 L43 43 Z"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* diagonal minor points */}
      <path
        d="M50 50 L72 28 M50 50 L72 72 M50 50 L28 72 M50 50 L28 28"
        strokeWidth="1"
        opacity="0.6"
      />
      <circle cx="50" cy="50" r="3.5" fill="currentColor" stroke="none" />
    </svg>
  )
}
