'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Wrench } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleClick = () => {
    // Mock sign-in - navigate to dashboard
    if (email && password) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left side - Sign in form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Sign in to your workspace</h1>
            <p className="text-muted-foreground">Welcome back — let&apos;s get you into the shop.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Work email</label>
              <input
                type="email"
                placeholder="you@shop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-border" />
                <span>Keep me signed in for 30 days</span>
              </label>
              <Link href="/forgot-password" className="text-primary hover:underline">
                Forgot?
              </Link>
            </div>

            <button
              type="button"
              onClick={handleClick}
              className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign in
            </button>
          </div>

          <div className="text-center text-sm">
            New to GarageOS?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Register your company
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Marketing */}
      <div className="hidden bg-gradient-to-br from-primary/5 to-accent/5 p-12 md:flex flex-col justify-between">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Wrench className="h-6 w-6 text-primary" />
          <span>GarageOS</span>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">Every bay, every branch, every job — one workspace.</h2>
            <p className="text-lg text-muted-foreground">
              Join 3,200+ shops running smoother days with GarageOS.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Manage service jobs and appointments",
              "Track inventory and parts",
              "Generate invoices automatically",
              "Monitor mechanics & utilization",
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
