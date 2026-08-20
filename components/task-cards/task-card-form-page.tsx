'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  Building2,
  Download,
  Edit3,
  Pencil,
  Plus,
  Trash2,
  Truck,
  UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/empty-state'
import { useBranch } from '@/lib/branch-context'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { taskCardFormSchema, type TaskCardFormData } from '@/lib/schemas'
import { useGarageStore, defaultCompanies } from '@/lib/store/garage-store'
import type { JobCard as StoreTaskCard } from '@/lib/types/store'
import { cn } from '@/lib/utils'

type TaskCardMode = 'create' | 'edit'

type TaskCardFormPageProps = {
  mode: TaskCardMode
  taskCardId?: string
}

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'Inprogress' },
  { label: 'Completed', value: 'compeleted' },
  { label: 'Cancelled', value: 'cancelled' },
]

const itemStatusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'Inprogress' },
  { label: 'Completed', value: 'compeleted' },
  { label: 'Cancelled', value: 'cancelled' },
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
]

const formatDateInput = (value?: string | Date) => {
  if (!value) return new Date().toISOString().slice(0, 10)
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10)
  return date.toISOString().slice(0, 10)
}

const addDaysToDateInput = (value: string | Date, days: number) => {
  const date = typeof value === 'string' ? new Date(value) : new Date(value)
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const formatPersonName = (firstName?: string, lastName?: string) => {
  const name = [firstName, lastName].filter((part) => part && part.trim()).join(' ').trim()
  return name || '—'
}

const isValidImageSource = (value?: string) =>
  Boolean(value && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:') || value.startsWith('/')))

const PDF_MARGIN = 40
const BRAND_COLOR: [number, number, number] = [37, 99, 235]
const BORDER: [number, number, number] = [226, 232, 240]

const safePdfText = (value: unknown, fallback = '—') => {
  if (value === null || value === undefined) return fallback
  const text = String(value).trim()
  return text || fallback
}

const resolveImageDataUrl = async (src?: string) => {
  if (!isValidImageSource(src)) return undefined
  if (src?.startsWith('data:')) return src
  try {
    const response = await fetch(src as string)
    if (!response.ok) return undefined
    const blob = await response.blob()
    return await new Promise<string | undefined>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : undefined)
      reader.onerror = () => resolve(undefined)
      reader.readAsDataURL(blob)
    })
  } catch {
    return undefined
  }
}

const createLogoFallback = (companyName: string) =>
  companyName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'C'

const initialLineItem = (): TaskCardFormData['lineItems'][number] => ({
  type: 'service',
  description: '',
  qty: 1,
  status: 'pending',
  assignedTo: '',
})

const normalizeLineItem = (item?: any): TaskCardFormData['lineItems'][number] => {
  return {
    ...(item?.id ? { id: Number(item.id) } : {}),
    type: item?.type === 'parts' ? 'parts' : 'service',
    description: item?.description ?? '',
    qty: Number(item?.qty ?? item?.quantity ?? 1) || 1,
    status: (['pending', 'Inprogress', 'compeleted', 'cancelled'].includes(item?.status)
      ? item?.status
      : 'pending') as any,
    assignedTo: item?.assignments?.[0]?.user_id ? String(item.assignments[0].user_id) : (item?.assignedTo ?? item?.mechanic ?? ''),
  }
}

export function TaskCardFormPage({ mode, taskCardId }: TaskCardFormPageProps) {
  const router = useRouter()
  const { selectedCompany } = useBranch()
  const { user } = useAuth()
  const {
    companies,
    customers,
    vehicles,
    settings,
  } = useGarageStore()
  const [apiTaskCard, setApiTaskCard] = useState<any>()
  const [quotationId, setQuotationId] = useState<string | undefined>()
  const [isTaskCardLoading, setIsTaskCardLoading] = useState(mode === 'edit')
  const [companyUsers, setCompanyUsers] = useState<{ id: string; name: string }[]>([])
  const [filledQuotationId, setFilledQuotationId] = useState<string | undefined>()
  const [apiVehicle, setApiVehicle] = useState<any>()
  const [apiCustomer, setApiCustomer] = useState<any>()
  const [apiCompany, setApiCompany] = useState<any>()

  const TaskCard = useMemo(
    () => apiTaskCard,
    [apiTaskCard],
  )

  useEffect(() => {
    setQuotationId(new URLSearchParams(window.location.search).get('quotation_id') ?? undefined)
  }, [])

  useEffect(() => {
    if (mode !== 'edit' || !taskCardId) return
    const loadTaskCard = async () => {
      try {
        const response = await fetch(`/backend-api/task-cards/${taskCardId}`)
        const result = await response.json()
        if (!response.ok || result.success === false || !result.data) throw new Error(result.message || 'Unable to load task card.')
        setApiTaskCard(result.data)
        setQuotationId(String(result.data.quotation_id))
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load task card.')
      } finally {
        setIsTaskCardLoading(false)
      }
    }
    void loadTaskCard()
  }, [mode, taskCardId])

  const activeCompanies = companies.length > 0 ? companies : defaultCompanies
  const currentCompany = apiCompany ?? activeCompanies.find((company) => company.id === selectedCompany) ?? activeCompanies[0]
  const companyForDetails = apiCompany ?? currentCompany
  const currentSettings = companyForDetails?.id ? settings[companyForDetails.id] : undefined
  const rawCompanyLogo =
    currentSettings?.logoUrl ??
    (companyForDetails as { logoUrl?: string; logo?: string } | undefined)?.logoUrl ??
    (companyForDetails as { logoUrl?: string; logo?: string } | undefined)?.logo
  const companyLogoUrl = isValidImageSource(rawCompanyLogo) ? rawCompanyLogo : undefined
  const companyInitials = createLogoFallback(companyForDetails?.name ?? 'Company')

  const companyName = companyForDetails?.name ?? 'Company'
  const companyEmail = currentCompany?.email ?? '—'
  const companyCountry = (currentCompany as any)?.country ?? '—'
  const companyPhone = currentCompany?.phone ?? '—'
  const companyAddress = [currentCompany?.address, currentCompany?.city, currentCompany?.state, currentCompany?.zipCode]
    .filter(Boolean)
    .join(', ') || '—'
  const companyRegNo = (currentCompany as any)?.registration_no ?? (currentCompany as any)?.registrationNo ?? '—'

  useEffect(() => {
    const companyId = apiCompany?.id ?? selectedCompany ?? currentCompany?.id
    if (!companyId) return

    const loadCompanyUsers = async () => {
      try {
        const response = await fetch(`/backend-api/company-users?company_id=${encodeURIComponent(String(companyId))}`)
        const result = await response.json()
        if (!response.ok || result.success === false) throw new Error(result.message || 'Unable to load company users.')
        setCompanyUsers((Array.isArray(result.data) ? result.data : []).map((companyUser: any) => ({
          id: String(companyUser.user_id),
          name: companyUser.user?.name || companyUser.user?.email || `User #${companyUser.user_id}`,
        })))
      } catch (error) {
        setCompanyUsers([])
        toast.error(error instanceof Error ? error.message : 'Unable to load company users.')
      }
    }
    void loadCompanyUsers()
  }, [apiCompany?.id, selectedCompany, currentCompany?.id])

  const defaultValues = useMemo<TaskCardFormData>(() => {
    const defaultCustomerId = TaskCard?.customerId ?? customers[0]?.id ?? ''
    const defaultVehicle =
      TaskCard?.vehicleId ??
      vehicles.find((vehicle) => vehicle.customerId === defaultCustomerId)?.id ??
      vehicles[0]?.id ??
      ''
    const defaultCreationDate = formatDateInput((TaskCard as any)?.creationDate ?? TaskCard?.createdAt)

    return {
      taskCardNumber: (TaskCard as any)?.taskCardNumber ?? TaskCard?.title ?? (TaskCard?.id ? `TC-${TaskCard.id}` : `TC-${Date.now()}`),
      customerId: defaultCustomerId,
      vehicleId: defaultVehicle,
      mileage: (TaskCard as any)?.mileage ?? 0,
      notes: TaskCard?.description ?? (TaskCard as any)?.notes ?? '',
      status: (['pending', 'Inprogress', 'compeleted', 'cancelled'].includes(TaskCard?.status as any)
        ? TaskCard?.status
        : 'pending') as any,
      priority: (['low', 'medium', 'high'].includes(TaskCard?.priority as any)
        ? TaskCard?.priority
        : 'medium') as any,
      creationDate: defaultCreationDate,
      dueDate: formatDateInput(TaskCard?.dueDate ?? addDaysToDateInput(defaultCreationDate, 7)),
      lineItems: ((TaskCard as any)?.tasks ?? TaskCard?.lineItems)?.length
        ? ((TaskCard as any)?.tasks ?? TaskCard?.lineItems).map((item: any) => normalizeLineItem({ ...item, status: item.task_status ?? item.status }))
        : [initialLineItem()],
    }
  }, [TaskCard, customers, vehicles])

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskCardFormData>({
    resolver: zodResolver(taskCardFormSchema) as any,
    defaultValues,
    mode: 'onChange',
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  useEffect(() => {
    if (!quotationId || filledQuotationId === quotationId) return

    const loadQuotationTasks = async () => {
      try {
        const response = await fetch(`/backend-api/quotations/${quotationId}`)
        const result = await response.json()
        if (!response.ok || result.success === false || !result.data) {
          throw new Error(result.message || 'Unable to load quotation details.')
        }

        const quotation = result.data
        if (quotation.company_id) {
          const companyResponse = await fetch(`/backend-api/companies/${quotation.company_id}`)
          const companyResult = await companyResponse.json()
          if (!companyResponse.ok || companyResult.success === false || !companyResult.data) {
            throw new Error(companyResult.message || 'Unable to load company details.')
          }
          setApiCompany(companyResult.data)
        }
        const quotationTasks = (Array.isArray(quotation.details) ? quotation.details : []).map((detail: any) => ({
          type: detail.type === 'parts' ? 'parts' : 'service',
          description: detail.description ?? '',
          qty: Number(detail.qty ?? 1) || 1,
          status: 'pending' as const,
          assignedTo: '',
        }))

        if (mode === 'create' && quotationTasks.length) {
          setValue('lineItems', quotationTasks, { shouldDirty: false, shouldValidate: true })
        }
        if (quotation.vehicle_id) {
          const vehicleId = String(quotation.vehicle_id)
          const vehicleResponse = await fetch(`/backend-api/vehicles/${vehicleId}`)
          const vehicleResult = await vehicleResponse.json()
          if (!vehicleResponse.ok || vehicleResult.success === false || !vehicleResult.data) {
            throw new Error(vehicleResult.message || 'Unable to load vehicle details.')
          }
          const vehicle = vehicleResult.data
          setApiVehicle(vehicle)

          const customerId = vehicle.customer_id ?? vehicle.customerId
          if (customerId) {
            setValue('customerId', String(customerId), { shouldDirty: false, shouldValidate: true })
            const customerResponse = await fetch(`/backend-api/customers/${customerId}`)
            const customerResult = await customerResponse.json()
            if (!customerResponse.ok || customerResult.success === false || !customerResult.data) {
              throw new Error(customerResult.message || 'Unable to load customer details.')
            }
            setApiCustomer(customerResult.data)
          }
          setValue('vehicleId', vehicleId, { shouldDirty: false, shouldValidate: true })
        }
        if (quotation.mileage !== undefined && quotation.mileage !== null) {
          setValue('mileage', Number(quotation.mileage), { shouldDirty: false, shouldValidate: true })
        }
        setFilledQuotationId(quotationId)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load quotation details.')
      }
    }

    void loadQuotationTasks()
  }, [mode, quotationId, filledQuotationId, setValue])

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'lineItems',
  })

  const watchedLineItems = useWatch({ control, name: 'lineItems' }) ?? []
  const watchedCustomerId = useWatch({ control, name: 'customerId' })
  const watchedVehicleId = useWatch({ control, name: 'vehicleId' })

  useEffect(() => {
    if (!watchedCustomerId && customers[0]?.id) {
      setValue('customerId', customers[0].id, { shouldDirty: false, shouldValidate: true })
    }
  }, [customers, watchedCustomerId, setValue])

  const selectedCustomer = apiCustomer?.id && String(apiCustomer.id) === watchedCustomerId
    ? apiCustomer
    : customers.find((customer) => customer.id === watchedCustomerId)
  const customerDisplayName = selectedCustomer?.name ?? formatPersonName(selectedCustomer?.firstName, selectedCustomer?.lastName)
  const customerEmail = selectedCustomer?.email ?? '—'
  const customerPhone = selectedCustomer?.phone ?? '—'
  const customerAddress = selectedCustomer?.address ?? '—'

  const filteredVehicles = useMemo(
    () =>
      watchedCustomerId
        ? vehicles.filter((vehicle) => vehicle.customerId === watchedCustomerId)
        : vehicles,
    [vehicles, watchedCustomerId],
  )

  useEffect(() => {
    if (apiVehicle?.id && String(apiVehicle.id) === watchedVehicleId) return
    if (filteredVehicles.length === 0) return
    const currentVehicle = filteredVehicles.find((vehicle) => vehicle.id === watchedVehicleId)
    if (!currentVehicle) {
      setValue('vehicleId', filteredVehicles[0].id, { shouldDirty: false, shouldValidate: true })
    }
  }, [apiVehicle, filteredVehicles, watchedVehicleId, setValue])

  const selectedVehicle = apiVehicle?.id && String(apiVehicle.id) === watchedVehicleId
    ? apiVehicle
    : vehicles.find((vehicle) => vehicle.id === watchedVehicleId)
  const vehicleDisplayName = selectedVehicle
    ? (selectedVehicle as any).name || [selectedVehicle.make, selectedVehicle.model].filter(Boolean).join(' ') || '—'
    : '—'
  const vehicleMake = selectedVehicle?.make ?? '—'
  const vehicleModel = selectedVehicle?.model ?? '—'
  const vehicleVariant = (selectedVehicle as any)?.variant ?? '—'
  const vehicleYear = selectedVehicle?.year ? String(selectedVehicle.year) : '—'
  const vehicleVin = selectedVehicle?.vin ?? (selectedVehicle as any)?.VIN ?? '—'
  const vehicleLicensePlate = selectedVehicle?.licensePlate ?? (selectedVehicle as any)?.license_plate ?? '—'
  const vehicleInsured = Number((selectedVehicle as any)?.insured) === 1 ? 'Yes' : 'No'

  const addRow = () => {
    append(initialLineItem(), { shouldFocus: false })
    window.requestAnimationFrame(() => {
      const nextIndex = fields.length
      const nextInput = document.querySelector<HTMLInputElement>(`[data-line-item-row="${nextIndex}"] input`)
      nextInput?.focus()
    })
  }

  const onSubmit = async (values: TaskCardFormData) => {
    if (!currentCompany?.id) {
      toast.error('Please select a company before saving this Task Card.')
      return
    }

    const payload: Omit<StoreTaskCard, 'id' | 'createdAt'> = {
      companyId: currentCompany.id,
      customerId: values.customerId,
      vehicleId: values.vehicleId,
      mechanicId: values.lineItems[0]?.assignedTo ?? 'm1',
      title: values.taskCardNumber,
      description: values.notes ?? '',
      lineItems: values.lineItems as any,
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      status: (values.status === 'Inprogress'
        ? 'in-progress'
        : values.status === 'compeleted'
        ? 'completed'
        : values.status === 'cancelled'
        ? 'on-hold'
        : 'pending') as any,
      priority: values.priority as any,
      dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
      photos: TaskCard?.photos ?? [],
      beforePictures: TaskCard?.beforePictures ?? [],
      afterPictures: TaskCard?.afterPictures ?? [],
      taskCardNumber: values.taskCardNumber,
      mileage: values.mileage,
      notes: values.notes,
      creationDate: values.creationDate,
    } as any

    const resolvedQuotationId = quotationId ?? (TaskCard as any)?.quotation_id
    if (!resolvedQuotationId) {
      toast.error('Open task cards from a quotation so its quotation ID can be assigned.')
      return
    }

    const apiPayload = {
      company_id: apiCompany?.id ?? selectedCompany ?? currentCompany.id,
      quotation_id: resolvedQuotationId,
      status: values.status === 'cancelled' ? 0 : 1,
      created_by: user?.id,
      updated_by: user?.id,
      tasks: values.lineItems.map((item: any) => ({
        ...(item.id ? { id: item.id } : {}),
        type: item.type,
        description: item.description,
        qty: Number(item.qty),
        task_status: item.status,
        status: item.status === 'cancelled' ? 0 : 1,
        created_by: user?.id,
        updated_by: user?.id,
      })),
    }

    try {
      const response = await fetch(`/backend-api/task-cards${mode === 'edit' && taskCardId ? `/${taskCardId}` : ''}`, {
        method: mode === 'edit' && taskCardId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.success === false) throw new Error(result.message || 'Unable to save task card.')
      toast.success(`Task Card ${mode === 'edit' ? 'updated' : 'created'} successfully.`)
      router.push(`/task-cards?quotation_id=${encodeURIComponent(String(resolvedQuotationId))}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save task card.')
    }
  }

  if (mode === 'edit' && taskCardId && !TaskCard && !isTaskCardLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <EmptyState
          title="Task Card not found"
          description="We could not find the Task Card you were trying to edit."
          action={{
            label: 'Back to Task Cards',
            onClick: () => router.push('/task-cards'),
          }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="rounded-3xl border border-border bg-card shadow-sm">
          {/* Header with Company details */}
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-lg font-bold text-primary ring-1 ring-border">
                  {companyLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={companyLogoUrl} alt={companyName} className="size-full object-cover" />
                  ) : (
                    companyInitials
                  )}
                </div>
                <div className="space-y-1">
                  <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{companyName}</h1>
                  <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2 sm:gap-x-6">
                    <p><span className="font-semibold text-foreground">Email:</span> {companyEmail}</p>
                    <p><span className="font-semibold text-foreground">Country:</span> {companyCountry}</p>
                    <p><span className="font-semibold text-foreground">Phone:</span> {companyPhone}</p>
                    <p><span className="font-semibold text-foreground">Reg No:</span> {companyRegNo}</p>
                    <p className="sm:col-span-2"><span className="font-semibold text-foreground">Address:</span> {companyAddress}</p>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-xs space-y-2 sm:pt-1">
                <Label htmlFor="creationDate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date
                </Label>
                <Input
                  id="creationDate"
                  type="date"
                  {...register('creationDate')}
                  className={cn(errors.creationDate && 'border-destructive')}
                />
                {errors.creationDate && (
                  <p className="text-xs font-medium text-destructive">{errors.creationDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Customer & Vehicle Details */}
          <div className="border-t border-border/70 px-5 py-5 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Building2 className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Customer Detail</h2>
                    <p className="text-xs text-muted-foreground">Linked record details</p>
                  </div>
                </div>

                <div className="space-y-1 text-sm leading-6 text-foreground pt-1">
                  <p><span className="text-muted-foreground">Name: </span><span className="font-medium">{customerDisplayName}</span></p>
                  <p><span className="text-muted-foreground">Email: </span><span>{customerEmail}</span></p>
                  <p><span className="text-muted-foreground">Phone: </span><span>{customerPhone}</span></p>
                  <p><span className="text-muted-foreground">Address: </span><span>{customerAddress}</span></p>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Truck className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Vehicle Detail</h2>
                    <p className="text-xs text-muted-foreground">Linked record details</p>
                  </div>
                </div>

                <div className="space-y-1 text-sm leading-6 text-foreground pt-1">
                  <p><span className="text-muted-foreground">Name: </span><span className="font-medium">{vehicleDisplayName}</span></p>
                  <p><span className="text-muted-foreground">Make: </span><span>{vehicleMake}</span></p>
                  <p><span className="text-muted-foreground">Model: </span><span>{vehicleModel}</span></p>
                  <p><span className="text-muted-foreground">Variant: </span><span>{vehicleVariant}</span></p>
                  <p><span className="text-muted-foreground">Year: </span><span>{vehicleYear}</span></p>
                  <p><span className="text-muted-foreground">VIN: </span><span>{vehicleVin}</span></p>
                  <p><span className="text-muted-foreground">License Plate: </span><span>{vehicleLicensePlate}</span></p>
                  <p><span className="text-muted-foreground">Insured: </span><span>{vehicleInsured}</span></p>
                </div>
              </section>
            </div>
          </div>

          {/* Task Card Core Details */}
          <div className="border-t border-border/70 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Task Card Details</h2>
                <p className="text-sm text-muted-foreground">Core work order information and status tracking.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setValue('taskCardNumber', `TC-${Date.now()}`, { shouldDirty: true })}>
                <Edit3 className="size-4" />
                Generate Number
              </Button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taskCardNumber">Task Card Number</Label>
                <Input
                  id="taskCardNumber"
                  placeholder="TC-0001"
                  {...register('taskCardNumber')}
                  className={cn(errors.taskCardNumber && 'border-destructive')}
                />
                {errors.taskCardNumber && <p className="text-xs font-medium text-destructive">{errors.taskCardNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage</Label>
                <Input
                  id="mileage"
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register('mileage', { valueAsNumber: true })}
                  className={cn(errors.mileage && 'border-destructive')}
                />
                {errors.mileage && <p className="text-xs font-medium text-destructive">{errors.mileage.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Task Card Status</Label>
                <Select
                  value={watch('status') ?? 'pending'}
                  onValueChange={(value) => setValue('status', value as TaskCardFormData['status'], { shouldDirty: true, shouldValidate: true })}
                >
                  <SelectTrigger className={cn('w-full', errors.status && 'border-destructive')}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-xs font-medium text-destructive">{errors.status.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={watch('priority') ?? 'medium'}
                  onValueChange={(value) => setValue('priority', value as TaskCardFormData['priority'], { shouldDirty: true, shouldValidate: true })}
                >
                  <SelectTrigger className={cn('w-full', errors.priority && 'border-destructive')}>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.priority && <p className="text-xs font-medium text-destructive">{errors.priority.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  placeholder="Add Task Card instructions or notes..."
                  {...register('notes')}
                  className={cn(errors.notes && 'border-destructive')}
                />
                {errors.notes && <p className="text-xs font-medium text-destructive">{errors.notes.message}</p>}
              </div>
            </div>
          </div>

          {/* Dynamic Task Items Section */}
          <div className="border-t border-border/70 px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Task Items</h2>
                <p className="text-sm text-muted-foreground">Add, edit, or remove specific tasks and assignees.</p>
              </div>

              <Button type="button" onClick={addRow} className="gap-2">
                <Plus className="size-4" />
                Add New
              </Button>
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-[960px] w-full border-collapse text-left text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="w-36 px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Description</th>
                    <th className="w-24 px-4 py-3 font-semibold">Qty</th>
                    <th className="w-40 px-4 py-3 font-semibold">Task Status</th>
                    <th className="w-48 px-4 py-3 font-semibold">Assigned To</th>
                    <th className="w-24 px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-background">
                  {fields.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        Add at least one task item to continue.
                      </td>
                    </tr>
                  ) : (
                    fields.map((field, index) => {
                      return (
                        <tr key={field.id} data-line-item-row={index} className="align-top">
                          {/* Type */}
                          <td className="px-4 py-4">
                            <Select
                              value={watch(`lineItems.${index}.type`) ?? 'service'}
                              onValueChange={(value) =>
                                setValue(`lineItems.${index}.type`, value as 'service' | 'parts', {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="service">Service</SelectItem>
                                <SelectItem value="parts">Parts</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>

                          {/* Description */}
                          <td className="px-4 py-4">
                            <Input
                              {...register(`lineItems.${index}.description` as const)}
                              placeholder="Describe the task or part"
                              className={cn(errors.lineItems?.[index]?.description && 'border-destructive')}
                            />
                            {errors.lineItems?.[index]?.description && (
                              <p className="mt-1 text-xs font-medium text-destructive">
                                {errors.lineItems?.[index]?.description?.message}
                              </p>
                            )}
                          </td>

                          {/* Qty */}
                          <td className="px-4 py-4">
                            <Input
                              type="number"
                              min={1}
                              {...register(`lineItems.${index}.qty` as const, { valueAsNumber: true })}
                              className={cn(errors.lineItems?.[index]?.qty && 'border-destructive')}
                            />
                            {errors.lineItems?.[index]?.qty && (
                              <p className="mt-1 text-xs font-medium text-destructive">
                                {errors.lineItems?.[index]?.qty?.message}
                              </p>
                            )}
                          </td>

                          {/* Task Status */}
                          <td className="px-4 py-4">
                            <Select
                              value={watch(`lineItems.${index}.status`) ?? 'pending'}
                              onValueChange={(value) =>
                                setValue(`lineItems.${index}.status`, value as any, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                {itemStatusOptions.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>

                          {/* Assigned To */}
                          <td className="px-4 py-4">
                            <Select
                              value={watch(`lineItems.${index}.assignedTo`) || undefined}
                              onValueChange={(value) =>
                                setValue(`lineItems.${index}.assignedTo`, value ?? '', {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                              }
                            >
                              <SelectTrigger className="w-full" disabled={companyUsers.length === 0}>
                                <SelectValue placeholder={companyUsers.length ? 'Select company user' : 'No company users'} />
                              </SelectTrigger>
                              <SelectContent>
                                {companyUsers.map((companyUser) => (
                                  <SelectItem key={companyUser.id} value={companyUser.id}>
                                    {companyUser.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const current = watch(`lineItems.${index}`)
                                  update(index, { ...current })
                                }}
                                aria-label={`Edit task ${index + 1}`}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                aria-label={`Delete task ${index + 1}`}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="border-t border-border/70 px-5 py-4 sm:px-6">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" variant="outline" onClick={() => router.push('/task-cards')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save Task Card' : 'Create Task Card'}
              </Button>
            </div>
          </div>
        </section>
      </form>
    </div>
  )
}
