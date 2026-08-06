'use client'

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock registration
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left side - Registration form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-muted-foreground">Join thousands of garage owners running smarter shops.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company name</label>
              <input
                name="companyName"
                placeholder="Your Garage Name"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Work email</label>
              <input
                type="email"
                name="email"
                placeholder="you@shop.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <input type="checkbox" className="h-4 w-4 rounded border-border" />
              <label>
                I agree to the{" "}
                <Link href="#" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button className="w-full" size="lg">
              Create account
            </Button>
          </form>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Marketing */}
      <div className="hidden bg-gradient-to-br from-accent/5 to-primary/5 p-12 md:flex flex-col justify-between">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Wrench className="h-6 w-6 text-primary" />
          <span>GarageOS</span>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">The operating system for modern auto garages.</h2>
            <p className="text-lg text-muted-foreground">
              Get a 14-day free trial to experience how 3,200+ shops manage their operations.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "No credit card required",
              "Full access to all features",
              "Dedicated onboarding support",
              "Easy data import from your current system",
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-accent text-background flex items-center justify-center text-sm font-bold mt-1">
                  ✓
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">© 2026 GarageOS Inc.</p>
      </div>
    </div>
  );
}
