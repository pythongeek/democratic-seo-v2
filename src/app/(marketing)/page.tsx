import { HeroSection } from "@/components/marketing/hero-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { DemocraticSection } from "@/components/marketing/democratic-section";
import { CommunityStats } from "@/components/marketing/community-stats";
import { CTASection } from "@/components/marketing/cta-section";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DemocraticSection />
        <CommunityStats />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
