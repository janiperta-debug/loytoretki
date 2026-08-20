import { SiteNav } from "@/components/site-nav"
import { Hero } from "@/components/hero"
import { ProblemSection } from "@/components/problem-section"
import { DiscoverySection } from "@/components/discovery-section"
import { TwoWaysSection } from "@/components/two-ways-section"
import { PlaceSection } from "@/components/place-section"
import { NotAStoreSection } from "@/components/not-a-store-section"
import { JourneySection } from "@/components/journey-section"
import { WorldGrowsSection } from "@/components/world-grows-section"
import { EmotionalStatement } from "@/components/emotional-statement"
import { FinalCta } from "@/components/final-cta"
import { SiteFooter } from "@/components/site-footer"

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <Hero />
        <ProblemSection />
        <DiscoverySection />
        <TwoWaysSection />
        <PlaceSection />
        <NotAStoreSection />
        <JourneySection />
        <WorldGrowsSection />
        <EmotionalStatement />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}
