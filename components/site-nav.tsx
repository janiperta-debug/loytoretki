'use client'

import { useEffect, useState } from 'react'
import { Menu, X, ArrowRight } from 'lucide-react'
import { CompassMark } from './compass-mark'

const links = [
  { label: 'Mikä se on', href: '#mika' },
  { label: 'Miten toimii', href: '#miten' },
  { label: 'Tulevaisuus', href: '#tulevaisuus' },
]

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-border/70'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5 min-h-11">
          <CompassMark
            className={`h-8 w-8 transition-colors ${
              scrolled ? 'text-brass' : 'text-brass'
            }`}
          />
          <span
            className={`font-serif text-lg font-semibold tracking-tight transition-colors ${
              scrolled ? 'text-foreground' : 'text-background'
            }`}
          >
            Löytöretki
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-brass ${
                scrolled ? 'text-foreground/80' : 'text-background/85'
              }`}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#liity"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brass px-5 text-sm font-semibold text-brass-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            Tutustu
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Sulje valikko' : 'Avaa valikko'}
          aria-expanded={open}
          className={`flex h-11 w-11 items-center justify-center rounded-full md:hidden ${
            scrolled ? 'text-foreground' : 'text-background'
          }`}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border/70 bg-background/95 backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center rounded-lg px-3 text-base font-medium text-foreground/90 hover:bg-secondary"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#liity"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex min-h-12 items-center justify-center gap-1.5 rounded-full bg-brass px-5 text-base font-semibold text-brass-foreground"
            >
              Tutustu Löytöretkeen
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
