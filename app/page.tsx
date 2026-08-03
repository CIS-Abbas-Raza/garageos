import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingTestimonials } from "@/components/landing/testimonials";
import { LandingFAQ } from "@/components/landing/faq";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <LandingHero />
      <LandingFeatures />
      <LandingTestimonials />
      <LandingFAQ />
      <footer className="border-t border-border bg-card py-12 text-center">
        <p className="text-sm text-muted-foreground">
          © 2026 GarageOS Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
