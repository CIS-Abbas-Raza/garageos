import { z } from 'zod'

export const customerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  zipCode: z.string().min(5, 'Zip code must be at least 5 characters'),
  notes: z.string().optional(),
})

export const vehicleSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1),
  vin: z.string().min(17, 'VIN must be 17 characters').max(17),
  licensePlate: z.string().min(1, 'License plate is required'),
  mileage: z.number().min(0, 'Mileage cannot be negative'),
  color: z.string().optional(),
})

export const mechanicSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
})

export const partSchema = z.object({
  partNumber: z.string().min(1, 'Part number is required'),
  name: z.string().min(1, 'Part name is required'),
  description: z.string().optional(),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  minStock: z.number().min(0, 'Min stock cannot be negative'),
  unitPrice: z.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
})

export const appointmentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  startTime: z.date(),
  endTime: z.date(),
  notes: z.string().optional(),
})

export const jobCardSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  customerId: z.string().min(1, 'Customer is required'),
  mechanicId: z.string().min(1, 'Mechanic is required'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().optional(),
})

export const estimationSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  customerId: z.string().min(1, 'Customer is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

export const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  dueDate: z.date(),
  notes: z.string().optional(),
})

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['cash', 'card', 'check', 'transfer']),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

export const supplierSchema = z.object({
  name: z.string().min(2, 'Supplier name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  zipCode: z.string().min(5, 'Zip code must be at least 5 characters'),
  contactPerson: z.string().optional(),
})

export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  dueDate: z.date().optional(),
  notes: z.string().optional(),
})

export type CustomerFormData = z.infer<typeof customerSchema>
export type VehicleFormData = z.infer<typeof vehicleSchema>
export type MechanicFormData = z.infer<typeof mechanicSchema>
export type PartFormData = z.infer<typeof partSchema>
export type AppointmentFormData = z.infer<typeof appointmentSchema>
export type JobCardFormData = z.infer<typeof jobCardSchema>
export type EstimationFormData = z.infer<typeof estimationSchema>
export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type PaymentFormData = z.infer<typeof paymentSchema>
export type SupplierFormData = z.infer<typeof supplierSchema>
export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>
