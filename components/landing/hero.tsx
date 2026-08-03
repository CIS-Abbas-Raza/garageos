import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function LandingHero() {
  return (
    <section className="container mx-auto max-w-7xl px-4 py-24 md:py-32 lg:py-40">
      <div className="space-y-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary font-medium">New: AI-assisted diagnostics</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-balance">
            The operating system for modern auto garages.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-balance">
            Manage job cards, inventory, appointments, and invoicing across every branch
            — with the polish your customers expect.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Start 14-day free trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            See how it works
          </Button>
        </div>
      </div>
      
      {/* Dashboard Preview */}
      <div className="mt-16 rounded-2xl border border-border bg-card p-2 shadow-xl md:p-4">
        <div className="space-y-4 rounded-lg border border-border bg-background p-6">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-auto text-xs text-muted-foreground">app.garageos.com/dashboard</span>
          </div>
          <div className="space-y-3">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-bold">$68,400</div>
                <div className="text-xs text-muted-foreground">REVENUE MTD</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs text-muted-foreground">ACTIVE JOBS</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-bold">24</div>
                <div className="text-xs text-muted-foreground">VEHICLES TODAY</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="text-2xl font-bold">82%</div>
                <div className="text-xs text-muted-foreground">UTILIZATION</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
