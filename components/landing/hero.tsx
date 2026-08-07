'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const dashboardViews = [
  {
    id: 1,
    name: "Dashboard Overview",
    stats: [
      { value: "$68,400", label: "REVENUE MTD" },
      { value: "12", label: "ACTIVE JOBS" },
      { value: "24", label: "VEHICLES TODAY" },
      { value: "82%", label: "UTILIZATION" },
    ],
  },
  {
    id: 2,
    name: "Job Cards Kanban",
    stats: [
      { value: "8", label: "PENDING" },
      { value: "14", label: "IN PROGRESS" },
      { value: "6", label: "READY FOR PICKUP" },
      { value: "32", label: "COMPLETED THIS MONTH" },
    ],
  },
  {
    id: 3,
    name: "Invoice Management",
    stats: [
      { value: "$45,200", label: "OUTSTANDING" },
      { value: "$68,400", label: "PAID THIS MONTH" },
      { value: "28", label: "PENDING INVOICES" },
      { value: "3.2 days", label: "AVG PAYMENT TIME" },
    ],
  },
];

export function LandingHero() {
  const [currentView, setCurrentView] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentView((prev) => (prev + 1) % dashboardViews.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const view = dashboardViews[currentView];

  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-16 md:py-32 lg:py-40">
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-32 right-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <div className={`space-y-8 text-center transition-all duration-700 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className={`inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 transition-all duration-700 delay-100 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">New: AI-assisted diagnostics</span>
          </div>

          <div className={`space-y-4 transition-all duration-700 delay-200 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-balance">
              The operating system for modern auto garages.
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-balance">
              Manage job cards, inventory, appointments, and invoicing across every branch
              — with the polish your customers expect.
            </p>
          </div>

          <div className={`flex flex-col gap-3 sm:flex-row sm:justify-center transition-all duration-700 delay-300 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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

          {/* Trusted by section */}
          <div className={`pt-8 transition-all duration-700 delay-400 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Trusted by growing garages
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              <div className="text-sm font-medium text-muted-foreground opacity-60">AutoCare Pro</div>
              <div className="text-sm font-medium text-muted-foreground opacity-60">FastFix Garage</div>
              <div className="text-sm font-medium text-muted-foreground opacity-60">TurboService</div>
              <div className="text-sm font-medium text-muted-foreground opacity-60">Elite Motors</div>
              <div className="text-sm font-medium text-muted-foreground opacity-60">QuickRepair Hub</div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview with Carousel */}
        <div className={`mt-16 transition-all duration-700 delay-500 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} onMouseEnter={() => setIsAutoPlay(false)} onMouseLeave={() => setIsAutoPlay(true)}>
          <div className="rounded-2xl border border-border bg-card p-2 shadow-xl md:p-4">
            <div className="space-y-4 rounded-lg border border-border bg-background p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-muted-foreground">app.garageos.com/{view.name.toLowerCase().replace(/\s+/g, '-')}</span>
              </div>

              {/* Carousel content with fade transition */}
              <div className="relative h-48 md:h-56">
                <div className="absolute inset-0 transition-opacity duration-500">
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-4 h-full">
                    {view.stats.map((stat, idx) => (
                      <div key={idx} className="rounded-lg border border-border bg-card p-4 flex flex-col justify-center">
                        <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Carousel indicators */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {dashboardViews.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentView(idx);
                      setIsAutoPlay(false);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentView ? 'w-8 bg-primary' : 'w-2 bg-muted'
                    }`}
                    aria-label={`View ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
