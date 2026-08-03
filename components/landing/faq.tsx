'use client'

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is GarageOS?",
    answer:
      "GarageOS is a comprehensive management system designed specifically for auto repair shops. It helps you manage jobs, customers, appointments, invoicing, and inventory all in one place.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! We offer a 14-day free trial with full access to all features. No credit card required to get started.",
  },
  {
    question: "How long does it take to set up?",
    answer:
      "Most shops are up and running within an hour. We provide onboarding support and training to help you get started quickly.",
  },
  {
    question: "Can I import my existing data?",
    answer:
      "Absolutely. Our import tools support most common formats. Our support team can help you migrate your data from your current system.",
  },
  {
    question: "What about support?",
    answer:
      "We offer 24/7 email support and live chat during business hours. Enterprise customers get a dedicated account manager.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. We use enterprise-grade encryption, regular backups, and comply with all major data protection regulations.",
  },
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="border-t border-border bg-card py-24 md:py-32">
      <div className="container mx-auto max-w-3xl px-4 space-y-12">
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Frequently asked questions
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden cursor-pointer hover:border-primary transition-colors border border-border rounded-lg"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="p-6 flex items-center justify-between bg-card">
                <h3 className="font-semibold">{faq.question}</h3>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </div>
              {openIndex === index && (
                <div className="border-t border-border bg-background px-6 py-4">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
