import {
  About,
  Contact,
  FAQ,
  Features,
  Footer,
  Hero,
  MarketingHeader,
  Pricing,
  ServicePackages,
  Testimonials,
} from '@/components/landing/marketing-sections'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-landing-background text-landing-foreground">
      <MarketingHeader />
      <main>
        <Hero />
        <Features />
        <ServicePackages />
        <Pricing />
        <Testimonials />
        <About />
        <Contact />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
