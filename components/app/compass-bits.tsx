import { BookOpen, Bike, Coffee, Blocks, Snowflake } from "lucide-react"
import { SCORE_META, type CompassScore, type ObservedItem } from "@/lib/loytoretki-data"

export function ScoreDot({ score, className = "" }: { score: CompassScore; className?: string }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${SCORE_META[score].dotClass} ${className}`}
      aria-hidden="true"
    />
  )
}

export function ScoreBadge({ score }: { score: CompassScore }) {
  const meta = SCORE_META[score]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]"
      style={{ backgroundColor: `color-mix(in oklch, ${meta.token} 18%, transparent)`, color: meta.token }}
    >
      <ScoreDot score={score} className="h-1.5 w-1.5" />
      {meta.label}
    </span>
  )
}

const ITEM_ICONS = {
  skate: Snowflake,
  mug: Coffee,
  book: BookOpen,
  bike: Bike,
  lego: Blocks,
} as const

export function ObservedIcon({ icon, className = "" }: { icon: ObservedItem["icon"]; className?: string }) {
  const Icon = ITEM_ICONS[icon]
  return <Icon className={className} strokeWidth={1.6} aria-hidden="true" />
}

/** Semicircular compass-style likelihood gauge. */
export function CompassGauge({ score }: { score: CompassScore }) {
  const fraction = score === "high" ? 0.86 : score === "mid" ? 0.52 : 0.2
  const angle = Math.PI * (1 - fraction) // 0..PI, left(low) -> right(high)
  const cx = 100
  const cy = 100
  const r = 78
  const nx = cx + Math.cos(angle) * (r - 12)
  const ny = cy - Math.sin(angle) * (r - 12)

  const arc = (start: number, end: number) => {
    const sx = cx + Math.cos(Math.PI * (1 - start)) * r
    const sy = cy - Math.sin(Math.PI * (1 - start)) * r
    const ex = cx + Math.cos(Math.PI * (1 - end)) * r
    const ey = cy - Math.sin(Math.PI * (1 - end)) * r
    return `M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}`
  }

  return (
    <svg viewBox="0 0 200 118" className="h-auto w-full" role="img" aria-label={`Kompassin arvio: ${SCORE_META[score].label}`}>
      <path d={arc(0, 0.34)} fill="none" stroke="var(--info)" strokeWidth={13} strokeLinecap="round" opacity={0.85} />
      <path d={arc(0.36, 0.64)} fill="none" stroke="var(--brass)" strokeWidth={13} strokeLinecap="round" opacity={0.9} />
      <path d={arc(0.66, 1)} fill="none" stroke="var(--forest)" strokeWidth={13} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--ink)" strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={7} fill="var(--ink)" />
      <circle cx={cx} cy={cy} r={3} fill="var(--brass)" />
    </svg>
  )
}
