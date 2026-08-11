'use client'

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, Wrench, X } from "lucide-react";

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

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
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        <div className="hidden items-center gap-4 md:flex">
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
      {menuOpen && (
        <nav className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {['Features', 'Testimonials', 'FAQ', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground">{item}</a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
              <Link href="/login" onClick={() => setMenuOpen(false)}><Button variant="outline" className="w-full">Sign in</Button></Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}><Button className="w-full">Start free trial</Button></Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
