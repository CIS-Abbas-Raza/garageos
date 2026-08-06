'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Wrench } from "lucide-react";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Wrench className="h-6 w-6 text-primary" />
          <span>GarageOS</span>
        </Link>
        <nav className="hidden gap-8 md:flex">
          <a href="#features" className="text-sm text-foreground/60 hover:text-foreground">
            Features
          </a>
          <a href="#testimonials" className="text-sm text-foreground/60 hover:text-foreground">
            Testimonials
          </a>
          <a href="#faq" className="text-sm text-foreground/60 hover:text-foreground">
            FAQ
          </a>
          <a href="#contact" className="text-sm text-foreground/60 hover:text-foreground">
            Contact
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">
              Start free trial
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
