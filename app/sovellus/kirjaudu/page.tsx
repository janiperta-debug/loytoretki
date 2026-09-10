"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Lock, Compass, User } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function KirjauduPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName.trim() || undefined },
            emailRedirectTo: `${window.location.origin}/sovellus/profiili`,
          },
        })

    setLoading(false)

    if (result.error) {
      const message = result.error.message
      if (message === "Invalid login credentials") {
        setError("Sähköposti tai salasana ei täsmää.")
      } else if (message.toLowerCase().includes("email not confirmed")) {
        setError("Sähköpostiosoitetta ei ole vielä vahvistettu. Tarkista sähköpostisi.")
      } else {
        setError(message)
      }
      return
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("Tili on luotu. Tarkista sähköpostisi ja vahvista osoitteesi. Vahvistuksen jälkeen voit kirjautua sisään.")
      return
    }

    router.replace("/sovellus/profiili")
  }

  async function handleGoogle() {
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/sovellus/profiili`,
      },
    })

    if (oauthError) {
      setLoading(false)
      setError(oauthError.message)
    }
  }

  function switchMode() {
    setMode(mode === "login" ? "signup" : "login")
    setError(null)
    setMessage(null)
  }

  return (
    <main className="min-h-full bg-background px-5 py-6">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-md flex-col">
        <Link href="/sovellus/profiili" className="mb-8 grid h-10 w-10 place-items-center rounded-full bg-card shadow-sm" aria-label="Takaisin profiiliin">
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="flex flex-1 flex-col justify-center pb-12">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-forest text-forest-foreground shadow-md">
              <Compass className="h-8 w-8 text-brass" strokeWidth={1.6} aria-hidden />
            </div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              {mode === "login" ? "Tervetuloa takaisin" : "Luo oma Löytöretkesi"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {mode === "login"
                ? "Kirjaudu sisään nähdäksesi tallennuksesi ja oman Löytöretkesi."
                : "Luo tili, niin voit tallentaa kohteita ja rakentaa omaa löytöhistoriaasi."}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <button type="button" onClick={handleGoogle} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 font-medium text-foreground transition-transform active:scale-[0.99] disabled:opacity-60">
              <span className="grid h-5 w-5 place-items-center rounded-full border border-border text-xs font-bold">G</span>
              Jatka Google-tilillä
            </button>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /><span>tai sähköpostilla</span><span className="h-px flex-1 bg-border" /></div>

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {mode === "signup" && (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">Nimi</span>
                  <span className="relative block"><User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><input type="text" autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-forest/20" placeholder="Oma nimi" /></span>
                </label>
              )}

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">Sähköposti</span>
                <span className="relative block"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-forest/20" placeholder="sinä@example.com" /></span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">Salasana</span>
                <span className="relative block"><Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><input type="password" required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-forest/20" placeholder="Vähintään 6 merkkiä" /></span>
              </label>

              {error && <p className="rounded-xl bg-clay/10 px-3 py-2.5 text-sm text-clay">{error}</p>}
              {message && <p className="rounded-xl bg-secondary px-3 py-2.5 text-sm text-foreground">{message}</p>}

              <button type="submit" disabled={loading} className="w-full rounded-xl bg-forest px-4 py-3.5 font-semibold text-forest-foreground shadow-sm transition-transform active:scale-[0.99] disabled:opacity-60">{loading ? "Hetki…" : mode === "login" ? "Kirjaudu sisään" : "Luo tili"}</button>
            </form>

            <button type="button" onClick={switchMode} className="mt-5 w-full text-center text-sm font-medium text-brass">
              {mode === "login" ? "Ei vielä tiliä? Luo tili" : "Onko sinulla jo tili? Kirjaudu sisään"}
            </button>
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">Löytöretkeä voi käyttää myös ilman tiliä. Tili tarvitaan omien tallennusten ja muiden henkilökohtaisten tietojen säilyttämiseen.</p>
        </div>
      </div>
    </main>
  )
}
