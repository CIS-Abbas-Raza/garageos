import {
  Wrench,
  BarChart3,
  Clock,
  Users,
  FileCheck,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Wrench,
    title: "Job Management",
    description:
      "Create, track, and complete service jobs with real-time status updates and mechanic assignments.",
  },
  {
    icon: BarChart3,
    title: "Business Analytics",
    description:
      "Get insights into revenue, utilization rates, and performance metrics at a glance.",
  },
  {
    icon: Clock,
    title: "Appointment Scheduling",
    description:
      "Manage customer appointments and vehicle service schedules with calendar integration.",
  },
  {
    icon: Users,
    title: "Customer Portal",
    description:
      "Let customers track their vehicle status and receive service updates in real-time.",
  },
  {
    icon: FileCheck,
    title: "Invoicing",
    description:
      "Generate and track invoices automatically with payment reminders and status tracking.",
  },
  {
    icon: Zap,
    title: "Inventory Management",
    description:
      "Keep track of parts, supplies, and low-stock alerts for essential items.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="border-t border-border bg-card py-24 md:py-32">
      <div className="container mx-auto max-w-7xl px-4 space-y-16">
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Everything you need to run your garage
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Purpose-built tools for modern auto repair shops
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="p-6 hover:shadow-lg transition-shadow rounded-lg border border-border bg-card">
                <Icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
