import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Marcus Johnson",
    role: "Owner, Thompson Auto Repair",
    content:
      "GarageOS cut our administrative time in half. We've been able to take on 40% more jobs without hiring extra staff.",
    rating: 5,
  },
  {
    name: "Patricia Chen",
    role: "Service Manager, Elite Motors",
    content:
      "Our customers love the real-time updates. Fewer complaint calls and better satisfaction scores since we switched.",
    rating: 5,
  },
  {
    name: "David Martinez",
    role: "Owner, Martinez Family Garage",
    content:
      "The invoicing features alone save us hours every week. The ROI was obvious in the first month.",
    rating: 5,
  },
];

export function LandingTestimonials() {
  return (
    <section id="testimonials" className="py-24 md:py-32">
      <div className="container mx-auto max-w-7xl px-4 space-y-16">
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Trusted by 3,200+ shops
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            See what our customers have to say about GarageOS
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="p-6 rounded-lg border border-border bg-card">
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="mb-4 text-foreground">&quot;{testimonial.content}&quot;</p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
