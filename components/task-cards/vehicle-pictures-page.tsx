'use client'

import { ChangeEvent, Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ImagePlus, Trash2, Truck, User } from 'lucide-react'
import { toast } from 'sonner'

import { useBranch } from '@/lib/branch-context'
import { useGarageStore, defaultCompanies } from '@/lib/store/garage-store'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'

const formatPersonName = (firstName?: string, lastName?: string) =>
  [firstName, lastName].filter(Boolean).join(' ') || '—'

const readImage = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read image'))
    reader.readAsDataURL(file)
  })

function PictureUpload({
  label,
  pictures,
  onAdd,
  onRemove,
}: {
  label: string
  pictures: string[]
  onAdd: (event: ChangeEvent<HTMLInputElement>) => void
  onRemove: (index: number) => void
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-border p-3 lg:p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">{label} Pictures</h2>
          <p className="mt-1 text-sm text-muted-foreground">Upload one or more vehicle photos.</p>
        </div>
        <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <ImagePlus className="size-4" />
          Add pictures
          <input type="file" accept="image/*" multiple className="sr-only" onChange={onAdd} />
        </label>
      </div>

      {pictures.length === 0 ? (
        <div className="flex min-h-16 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground lg:min-h-12">
          No {label.toLowerCase()} pictures added yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {pictures.map((picture, index) => (
            <div key={`${picture.slice(0, 30)}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={picture} alt={`${label} vehicle photo ${index + 1}`} className="size-full object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 size-8 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                onClick={() => onRemove(index)}
                aria-label={`Remove ${label.toLowerCase()} picture ${index + 1}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export function VehiclePicturesPage({ taskCardId }: { taskCardId: string }) {
  const router = useRouter()
  const { selectedCompany } = useBranch()
  const { jobCards, customers, vehicles, companies, updateJobCard } = useGarageStore()
  const taskCard = jobCards.find((item) => item.id === taskCardId)
  const [beforePictures, setBeforePictures] = useState<string[]>(taskCard?.beforePictures ?? [])
  const [afterPictures, setAfterPictures] = useState<string[]>(taskCard?.afterPictures ?? [])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!taskCard) return
    setBeforePictures(taskCard.beforePictures ?? [])
    setAfterPictures(taskCard.afterPictures ?? [])
  }, [taskCard])

  const activeCompanies = companies.length > 0 ? companies : defaultCompanies
  const currentCompany = activeCompanies.find((company) => company.id === selectedCompany) ?? activeCompanies[0]
  const customer = taskCard ? customers.find((item) => item.id === taskCard.customerId) : undefined
  const vehicle = taskCard ? vehicles.find((item) => item.id === taskCard.vehicleId) : undefined
  const companyAddress = [currentCompany?.address, currentCompany?.city, currentCompany?.state, currentCompany?.zipCode].filter(Boolean).join(', ') || '—'
  const vehicleName = vehicle ? `${vehicle.make} ${vehicle.model}` : '—'
  const customerName = formatPersonName(customer?.firstName, customer?.lastName)
  const vehicleDetails = useMemo(() => [
    ['Make', vehicle?.make ?? '—'],
    ['Model', vehicle?.model ?? '—'],
    ['Year', vehicle?.year ? String(vehicle.year) : '—'],
    ['VIN', vehicle?.vin ?? '—'],
    ['License Plate', vehicle?.licensePlate ?? '—'],
  ], [vehicle])

  const addPictures = (setter: Dispatch<SetStateAction<string[]>>) => async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    try {
      const images = await Promise.all(files.map(readImage))
      setter((current) => [...current, ...images])
    } catch {
      toast.error('One or more images could not be uploaded.')
    }
    event.target.value = ''
  }

  const savePictures = () => {
    if (!taskCard) return
    setIsSaving(true)
    updateJobCard(taskCard.id, {
      beforePictures,
      afterPictures,
      photos: [...beforePictures, ...afterPictures],
    })
    toast.success('Vehicle pictures saved successfully.')
    router.push('/task-cards')
  }

  if (!taskCard) {
    return <EmptyState title="Task Card not found" description="We could not find the Task Card for these vehicle pictures." action={{ label: 'Back to Task Cards', onClick: () => router.push('/task-cards') }} />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-2">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between lg:mb-3 lg:gap-2">
        <div>
          <Button type="button" variant="ghost" className="mb-2 -ml-3 gap-2" onClick={() => router.push('/task-cards')}>
            <ArrowLeft className="size-4" /> Back to Task Cards
          </Button>
          <p className="text-sm font-medium text-primary">{(taskCard as any).taskCardNumber ?? taskCard.title}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Vehicle Pictures</h1>
          <p className="mt-2 text-sm text-muted-foreground">Document the vehicle condition before and after service.</p>
        </div>
        <Button type="button" onClick={savePictures} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Pictures'}
        </Button>
      </div>

      <section className="rounded-3xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/70 p-3 sm:p-4">
          <h2 className="text-xl font-semibold text-foreground">{currentCompany?.name ?? 'Company'}</h2>
          <div className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
            <p><span className="font-medium text-foreground">Email:</span> {currentCompany?.email ?? '—'}</p>
            <p><span className="font-medium text-foreground">Phone:</span> {currentCompany?.phone ?? '—'}</p>
            <p className="sm:col-span-2"><span className="font-medium text-foreground">Address:</span> {companyAddress}</p>
          </div>
        </div>

        <div className="grid gap-4 border-b border-border/70 p-3 sm:p-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><User className="size-4" /></span><h2 className="font-semibold">Customer Detail</h2></div>
            <div className="space-y-1 text-sm leading-6"><p><span className="text-muted-foreground">Name: </span>{customerName}</p><p><span className="text-muted-foreground">Email: </span>{customer?.email ?? '—'}</p><p><span className="text-muted-foreground">Phone: </span>{customer?.phone ?? '—'}</p><p><span className="text-muted-foreground">Address: </span>{customer?.address ?? '—'}</p></div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Truck className="size-4" /></span><h2 className="font-semibold">Vehicle Detail</h2></div>
            <p className="text-sm font-medium">{vehicleName}</p>
            <div className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">{vehicleDetails.map(([label, value]) => <p key={label}><span className="text-muted-foreground">{label}: </span>{value}</p>)}</div>
          </div>
        </div>

        <div className="grid gap-3 p-3 sm:p-4 lg:grid-cols-2">
          <PictureUpload label="Before" pictures={beforePictures} onAdd={addPictures(setBeforePictures)} onRemove={(index) => setBeforePictures((current) => current.filter((_, itemIndex) => itemIndex !== index))} />
          <PictureUpload label="After" pictures={afterPictures} onAdd={addPictures(setAfterPictures)} onRemove={(index) => setAfterPictures((current) => current.filter((_, itemIndex) => itemIndex !== index))} />
        </div>
      </section>
    </div>
  )
}
