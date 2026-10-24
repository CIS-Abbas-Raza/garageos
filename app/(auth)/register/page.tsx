'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

type DemoBookingForm = {
  name: string
  company_name: string
  phone: string
  country: string
  email: string
}

const emptyForm: DemoBookingForm = {
  name: '',
  company_name: '',
  phone: '',
  country: '',
  email: '',
}

const inputClasses = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary'

export default function RegisterPage() {
  const [formData, setFormData] = useState<DemoBookingForm>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/backend-api/demo-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Could not submit your Demo request.')
      }

      toast.success('Your Demo request has been received. We’ll be in touch soon.')
      setFormData(emptyForm)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not submit your Demo request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Book a Demo</h1>
            <p className="text-muted-foreground">Tell us about your garage and our team will get in touch.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <input id="name" name="name" autoComplete="name" placeholder="Your name" value={formData.name} onChange={handleChange} required maxLength={255} className={inputClasses} />
            </div>

            <div className="space-y-2">
              <label htmlFor="company_name" className="text-sm font-medium">Company name</label>
              <input id="company_name" name="company_name" autoComplete="organization" placeholder="Your garage name" value={formData.company_name} onChange={handleChange} required maxLength={255} className={inputClasses} />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Phone</label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Your phone number" value={formData.phone} onChange={handleChange} required maxLength={50} className={inputClasses} />
            </div>

            <div className="space-y-2">
              <label htmlFor="country" className="text-sm font-medium">Country</label>
              <input id="country" name="country" autoComplete="country-name" placeholder="Your country" value={formData.country} onChange={handleChange} required maxLength={100} className={inputClasses} />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" value={formData.email} onChange={handleChange} required maxLength={255} className={inputClasses} />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Sending request…' : 'Request a Demo'}
            </Button>
          </form>

          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </div>
        </div>
      </div>

      <div className="hidden flex-col bg-[#E6EFFD] p-12 md:flex">
        <Link href="/" aria-label="GarageWorkOs home" className="flex w-fit items-center gap-4">
          <Image src="/garageworkos-logo.png" alt="" width={128} height={64} priority className="h-10 w-16 shrink-0 object-contain" />
          <span className="flex flex-col gap-1">
            <span className="text-2xl font-bold leading-none tracking-tight" style={{ fontFamily: '"Segoe UI", sans-serif' }}>
              <span className="text-[#2563eb]">GarageWork</span><span className="text-[#0b1220]">Os</span>
            </span>
            <span className="text-xs text-muted-foreground">Workshop Management System</span>
          </span>
        </Link>

        <div className="mt-7 space-y-6">
          <div>
            <h2 className="mb-4 text-3xl font-bold">The operating system for modern auto garages.</h2>
            <p className="text-lg text-muted-foreground">See how GarageWorkOs can help your team run a more organized shop.</p>
          </div>
          <div className="space-y-4">
            {[
              'No credit card required',
              'Full access to all features',
              'Dedicated onboarding support',
              'Easy job tracking and work order management',
              'Real-time updates on garage operations',
              'Simplified customer and vehicle management',
              'Automated invoicing and billing',
              'Secure cloud-based data access',
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2563eb]"><Check className="size-3 text-white" strokeWidth={4} /></span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-auto pt-8 text-right text-xs text-muted-foreground">© 2026 GarageWorkOs Inc.</p>
      </div>
    </div>
  )
}
