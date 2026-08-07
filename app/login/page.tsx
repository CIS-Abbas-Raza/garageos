'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, BarChart3, Eye, EyeOff, Gauge, LockKeyhole, ShieldCheck, Wrench } from 'lucide-react'
import { toast } from 'sonner'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, type LoginFormData } from '@/lib/schemas'
import { useAuthStore } from '@/lib/store/auth-store'

const benefits = [
  { icon: Gauge, value: '2.4x', label: 'faster job intake' },
  { icon: BarChart3, value: '35%', label: 'more repeat visits' },
  { icon: ShieldCheck, value: '99.9%', label: 'data reliability' },
]

export default function LoginPage() {
  const router = useRouter()
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const login = useAuthStore((state) => state.login)
  const [showPassword, setShowPassword] = useState(false)

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard')
    }
  }, [isLoggedIn, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    // Simulate a brief delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 700))
    
    // Mock login - store the session
    login(data.email)
    
    toast.success('Sign in successful! Welcome back to GarageOS.')
    
    // Redirect to dashboard
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(480px,0.9fr)]">
      <section className="flex min-h-screen flex-col bg-background px-6 py-6 sm:px-10 lg:px-16 lg:py-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="GarageOS home">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Wrench className="size-5" aria-hidden="true" />
            </span>
            <span className="text-xl font-semibold tracking-tight">GarageOS</span>
          </Link>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center py-12 lg:py-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-9">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Welcome back</p>
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">Sign in to your garage.</h1>
              <p className="mt-4 text-pretty leading-6 text-muted-foreground">
                Keep every customer, vehicle, and job moving from one calm workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@garage.com"
                  {...register('email')}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <span className="text-xs font-medium text-destructive">{errors.email.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...register('password')}
                    aria-invalid={errors.password ? 'true' : 'false'}
                    className={`pr-11 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-xs font-medium text-destructive">{errors.password.message}</span>
                )}
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 h-11 w-full">
                {isSubmitting ? 'Signing in...' : 'Sign in to your account'}
                {!isSubmitting && <ArrowRight data-icon="inline-end" />}
              </Button>
            </form>

            <div className="my-7 flex items-center gap-4 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              <span>or continue with</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11 w-full"
              onClick={() => toast.info('Google sign-in is available in the connected app.')}
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">G</span>
              Continue with Google
            </Button>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              New to GarageOS?{' '}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground lg:text-left">© 2026 GarageOS. Built for better bays.</p>
      </section>

      <aside className="relative hidden overflow-hidden bg-primary px-10 py-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:px-16 lg:py-16">
        <div className="absolute -right-24 -top-24 size-72 rounded-full border border-primary-foreground/15" aria-hidden="true" />
        <div className="absolute -bottom-36 -left-28 size-96 rounded-full border border-primary-foreground/10" aria-hidden="true" />

        <div className="relative">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">
            <LockKeyhole className="size-4" aria-hidden="true" />
            Garage operations, simplified
          </div>
          <h2 className="mt-10 max-w-xl text-pretty text-5xl font-semibold leading-[1.05] tracking-tight xl:text-6xl">
            The calm center of your shop.
          </h2>
          <p className="mt-7 max-w-lg text-lg leading-8 text-primary-foreground/75">
            Replace disconnected spreadsheets and sticky notes with a single operating system your whole team can trust.
          </p>
        </div>

        <div className="relative mt-16 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {benefits.map(({ icon: Icon, value, label }) => (
            <div key={label} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-5 backdrop-blur-sm">
              <Icon className="size-5 text-primary-foreground/75" aria-hidden="true" />
              <p className="mt-8 text-3xl font-semibold tracking-tight">{value}</p>
              <p className="mt-1 text-sm text-primary-foreground/70">{label}</p>
            </div>
          ))}
        </div>
      </aside>
    </main>
  )
}
