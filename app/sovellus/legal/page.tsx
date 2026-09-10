import Link from "next/link"
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react"

export default function LegalPage() {
  return (
    <div className="min-h-full">
      <header className="border-b border-border/70 bg-card/80 px-5 pb-5 pt-6 backdrop-blur">
        <Link href="/sovellus/profiili" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Takaisin profiiliin
        </Link>
        <div className="mt-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary">
            <ShieldCheck className="h-6 w-6 text-brass" aria-hidden />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">Tietosuoja ja käyttöehdot</h1>
            <p className="text-sm text-muted-foreground">Löytöretken periaatteet selkeästi.</p>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-5 py-6 text-sm leading-6 text-foreground/90">
        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground">1. Mikä Löytöretki on?</h2>
          <p className="mt-2">Löytöretki auttaa etsimään kiinnostavia tuotteita ja paikkoja. Kompassi perustuu saatavilla olevaan tietoon ja käyttäjien havaintoihin. Se ohjaa, mutta ei takaa, että tuote löytyy.</p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground">2. Havainnot ja Retkeilijän loki</h2>
          <p className="mt-2">Havainto on erillinen tieto siitä, mitä käyttäjä on nähnyt tai huomannut. Retkeilijän loki on julkinen yhteisöllinen päiväkirja, johon kirjautunut käyttäjä voi tehdä omalla tilillään merkintöjä.</p>
          <p className="mt-2">Julkiseen lokiin tai havaintoon ei pidä kirjoittaa henkilötietoja, joita ei ole tarkoitettu muiden nähtäviksi.</p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground">3. Oma päiväkirja ja tallennukset</h2>
          <p className="mt-2">Oma päiväkirja, tallennetut haut ja tallennetut kohteet kuuluvat kirjautuneen käyttäjän henkilökohtaiseen sisältöön. Niitä ei näytetä muille käyttäjille tämän sovelluksen kautta.</p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground">4. Tili ja kirjautuminen</h2>
          <p className="mt-2">Löytöretkeä voi käyttää ilman tiliä. Tiliä tarvitaan henkilökohtaisten tallennusten ja oman sisällön hallintaan. Kirjautuminen voidaan tehdä sähköpostilla ja salasanalla tai tuetulla Google-kirjautumisella.</p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground">5. Sijainti</h2>
          <p className="mt-2">Kartta voi pyytää laitteen sijaintia lähimpien kohteiden näyttämistä varten. Sijaintilupa annetaan laitteen omassa selaimessa. Löytöretken nykyinen karttakäyttö käyttää sijaintia paikallisesti eikä tallenna GPS-sijaintia käyttäjän profiiliin.</p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground">6. Paikka- ja karttatiedot</h2>
          <p className="mt-2">Karttataustana käytetään OpenStreetMapia. Kohdetietojen ajantasaisuus voi vaihdella, joten aukioloajat, palvelut ja muut tiedot kannattaa varmistaa suoraan kohteesta.</p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">Kartta: © OpenStreetMap contributors <ExternalLink className="h-3 w-3" aria-hidden /></p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground">7. Käyttäjien vastuu</h2>
          <p className="mt-2">Käyttäjä vastaa omista julkaisemistaan tiedoista. Älä julkaise toisen henkilön henkilötietoja, kuvia tai muuta sisältöä ilman asianmukaista oikeutta. Löytöretkeä ei tule käyttää lain tai muiden oikeuksien vastaiseen toimintaan.</p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-foreground">8. Tiedon luotettavuus</h2>
          <p className="mt-2">Löytöretken tiedot voivat olla puutteellisia tai vanhentuneita. Käyttäjähavainnot ovat havaintoja, eivät lupauksia tuotteen saatavuudesta. Erityisesti Kompassin tuloksia tulee käyttää suuntana oman harkinnan tukena.</p>
        </section>

        <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h2 className="font-serif text-base font-semibold text-foreground">Ylläpitäjän tiedot</h2>
          <p className="mt-2 text-muted-foreground">Palvelun ylläpitäjän nimi, yhteystiedot ja muut rekisterinpitäjää koskevat tiedot täydennetään tähän ennen julkista tuotantojulkaisua.</p>
        </section>

        <p className="border-t border-border pt-4 text-xs text-muted-foreground">Löytöretki on tällä hetkellä testausvaiheessa. Näitä ehtoja ja tietosuojatietoja täydennetään tarvittaessa testaajien palautteen ja lopullisen palvelumallin perusteella.</p>
      </div>
    </div>
  )
}
