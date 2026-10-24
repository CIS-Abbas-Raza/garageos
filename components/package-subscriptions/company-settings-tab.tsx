'use client'

import { useEffect, useState } from 'react'
import { Building2, Camera, ImagePlus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CountryStateSelect from '@/components/ui/country-state-select'
import { useBranch } from '@/lib/branch-context'

type CompanyForm = {
  name: string
  email: string
  phone: string
  country: string
  state: string
  address: string
  registrationNo: string
  logo: string
}

type ActiveSubscription = {
  packageName: string
  endDate: string
}

const emptyCompany: CompanyForm = {
  name: '', email: '', phone: '', country: 'United States', state: '', address: '', registrationNo: '', logo: '',
}

export function CompanySettingsTab() {
  const { selectedCompany } = useBranch()
  const [company, setCompany] = useState<CompanyForm>(emptyCompany)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [removeLogo, setRemoveLogo] = useState(false)
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!selectedCompany) {
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    fetch(`/backend-api/companies/${encodeURIComponent(selectedCompany)}`)
      .then(async (response) => {
        const result = await response.json().catch(() => ({}))
        if (!response.ok || result.success === false || !result.data) {
          throw new Error(result.message || 'Unable to load company settings.')
        }
        if (!cancelled) {
          const record = result.data
          setCompany({
            name: record.name ?? '',
            email: record.email ?? '',
            phone: record.phone ?? '',
            country: record.country ?? 'United States',
            state: record.state ?? '',
            address: record.address ?? '',
            registrationNo: record.registration_no ?? record.registrationNo ?? '',
            logo: record.logo ?? '',
          })
          setLogoPreview(record.logo ?? '')
          setLogoFile(null)
          setRemoveLogo(false)
        }
      })
      .catch((error) => {
        if (!cancelled) toast.error(error instanceof Error ? error.message : 'Unable to load company settings.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [selectedCompany])

  useEffect(() => {
    if (!selectedCompany) {
      setActiveSubscription(null)
      return
    }

    let cancelled = false
    fetch(`/backend-api/package-histories?company_id=${encodeURIComponent(selectedCompany)}`)
      .then(async (response) => {
        const result = await response.json().catch(() => ({}))
        if (!response.ok || result.success === false || !Array.isArray(result.data)) return

        const now = Date.now()
        const latestActive = result.data
          .filter((record: any) => Number(record.status) === 1 && record.end_date && new Date(record.end_date).getTime() >= now)
          .sort((a: any, b: any) => Number(b.id) - Number(a.id))[0]

        if (!cancelled) {
          setActiveSubscription(latestActive ? {
            packageName: latestActive.package?.name ?? 'Package',
            endDate: latestActive.end_date,
          } : null)
        }
      })
      .catch(() => { if (!cancelled) setActiveSubscription(null) })

    return () => { cancelled = true }
  }, [selectedCompany])

  const setField = (field: keyof CompanyForm, value: string) => {
    setCompany((current) => ({ ...current, [field]: value }))
  }

  const selectLogo = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Select an image file for the company logo.')
    if (file.size > 2 * 1024 * 1024) return toast.error('Company logo must be smaller than 2MB.')
    setLogoFile(file)
    setRemoveLogo(false)
    setLogoPreview(URL.createObjectURL(file))
  }

  const saveCompany = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedCompany) return toast.error('Select a company before updating its settings.')
    setIsSaving(true)
    try {
      const body = new FormData()
      body.append('phone', company.phone.trim())
      body.append('country', company.country)
      body.append('state', company.state)
      body.append('address', company.address.trim())
      body.append('registration_no', company.registrationNo.trim())
      if (logoFile) body.append('logo', logoFile)
      if (removeLogo) body.append('remove_logo', 'true')

      const response = await fetch(`/backend-api/companies/${encodeURIComponent(selectedCompany)}`, { method: 'PUT', body })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.success === false || !result.data) {
        throw new Error(result.message || 'Unable to save company settings.')
      }
      setCompany((current) => ({ ...current, logo: result.data.logo ?? current.logo }))
      setLogoPreview(result.data.logo ?? '')
      setLogoFile(null)
      setRemoveLogo(false)
      toast.success('Company settings updated.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save company settings.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!selectedCompany) {
    return <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Select a company to view its settings.</div>
  }

  if (isLoading) {
    return <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Loading company settings...</div>
  }

  return (
    <form onSubmit={saveCompany} className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="border-b border-border pb-4">
          <h2 className="font-semibold">Company Logo</h2>
          <p className="mt-1 text-xs text-muted-foreground">Upload a JPG, PNG, or WebP image up to 2MB.</p>
        </div>
        <label className="mt-6 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-primary/[0.03] px-4 text-center hover:bg-primary/[0.06]">
          <span className="flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-primary/40 bg-primary/10 text-primary">
            {logoPreview ? <img src={logoPreview} alt="Company logo preview" className="size-full object-cover" /> : <Camera className="size-8" />}
          </span>
          <span className="mt-4 text-xs font-semibold">Click or drag to upload</span>
          <span className="mt-1 text-[11px] text-muted-foreground">JPG, PNG, or WebP</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => selectLogo(event.target.files?.[0])} />
        </label>
        {logoPreview && <Button type="button" variant="ghost" size="sm" className="mx-auto mt-3 flex" onClick={() => { setLogoPreview(''); setLogoFile(null); setRemoveLogo(true) }}><Trash2 className="size-4" /> Remove photo</Button>}
        <div className="mt-5 text-center"><p className="font-semibold">{company.name || 'Company name'}</p><p className="mt-1 truncate text-xs text-muted-foreground">{company.email || 'company@email.com'}</p></div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-semibold"><ImagePlus className="size-5 text-primary" /> Company Information</h2>
            <p className="mt-1 text-xs text-muted-foreground">Update the selected company&apos;s contact and registration details.</p>
          </div>
          <div className="shrink-0 text-xs sm:w-56">
            {activeSubscription ? <>
              <p className="flex items-start gap-1 font-semibold text-foreground"><span className="shrink-0">Package Name:</span><span className="min-w-0 flex-1 break-words">{activeSubscription.packageName}</span><span className="mt-1 size-2 shrink-0 rounded-full bg-emerald-500" aria-label="Active subscription" /></p>
              <p className="mt-1 text-left font-semibold text-muted-foreground">Valid Till Date: {new Date(activeSubscription.endDate).toLocaleDateString()}</p>
            </> : <p className="text-muted-foreground">No active package</p>}
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="company-setting-name">Company Name</Label><Input id="company-setting-name" value={company.name} readOnly aria-readonly="true" className="bg-muted/50" /></div>
          <div className="space-y-2"><Label htmlFor="company-setting-email">Email</Label><Input id="company-setting-email" type="email" value={company.email} readOnly aria-readonly="true" className="bg-muted/50" /></div>
          <div className="space-y-2"><Label htmlFor="company-setting-phone">Phone *</Label><Input id="company-setting-phone" type="tel" value={company.phone} onChange={(event) => setField('phone', event.target.value)} required /></div>
          <div className="sm:col-span-2"><CountryStateSelect country={company.country} state={company.state} onCountryChange={(value) => setField('country', value)} onStateChange={(value) => setField('state', value)} required /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="company-setting-address">Address *</Label><Input id="company-setting-address" value={company.address} onChange={(event) => setField('address', event.target.value)} required /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="company-setting-registration">Registration No. *</Label><Input id="company-setting-registration" value={company.registrationNo} onChange={(event) => setField('registrationNo', event.target.value)} required /></div>
        </div>
        <div className="mt-6 flex justify-end border-t border-border pt-4">
          <Button type="submit" disabled={isSaving}><Save className="size-4" /> {isSaving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </section>
    </form>
  )
}
