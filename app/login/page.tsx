'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Eye, EyeOff, GraduationCap, UsersRound, Wrench } from 'lucide-react'
import { toast } from 'sonner'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, type LoginFormData } from '@/lib/schemas'
import { useAuth } from '@/lib/auth-context'

const benefits = [
  { icon: UsersRound, value: '500+', label: 'Active customers' },
  { icon: GraduationCap, value: '50+', label: 'Expert technicians' },
  { icon: Building2, value: '3', label: 'Workshop locations' },
]

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    try {
      await login(data.email, data.password)
      toast.success('Sign in successful! Welcome back to GarageOS.')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error?.message || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-2">
      <section className="flex min-h-screen flex-col bg-background px-6 py-8 sm:px-10 lg:px-16 lg:py-12 xl:px-24">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="GarageOS home">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wrench className="size-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-xl font-bold tracking-tight">GarageOS</span>
              <span className="block text-xs text-muted-foreground">Workshop Management System</span>
            </span>
          </Link>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center py-14 lg:py-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Welcome back</h1>
              <p className="mt-3 text-lg leading-7 text-muted-foreground">Sign in to access your workshop portal</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@garageos.com"
                  {...register('email')}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <span className="text-xs font-medium text-destructive">{errors.email.message}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
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
                    className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                  </button>
                </div>
                {errors.password && <span className="text-xs font-medium text-destructive">{errors.password.message}</span>}
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 h-12 w-full text-base">
                {isSubmitting ? 'Signing in...' : 'Sign in to your account'}
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-muted-foreground">
              Demo credentials:{' '}
              <span className="font-semibold text-primary">admin@garageos.com</span> /{' '}
              <span className="font-semibold text-primary">password</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground lg:text-left">© 2026 GarageOS. Built for better workshops.</p>
      </section>

      <aside className="relative hidden overflow-hidden bg-primary/5 px-10 py-12 lg:flex lg:flex-col lg:justify-center lg:px-16 xl:px-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-2xl">
          <div className="max-w-2xl">
            <h2 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight xl:text-6xl">
              Streamline Your
              <span className="block text-primary">Workshop Management</span>
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
              Comprehensive tools to manage customers, vehicles, jobs, and invoices all in one powerful platform.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {benefits.map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-2xl border border-border/60 bg-card p-6 shadow-lg shadow-primary/5">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon aria-hidden="true" />
                </div>
                <p className="mt-7 text-4xl font-bold tracking-tight">{value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  )
}
