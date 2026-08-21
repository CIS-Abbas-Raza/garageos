'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import * as Types from '../types/store'

interface GarageStore {
  // Company
  currentCompanyId: string
  setCurrentCompanyId: (id: string) => void
  companies: Types.Company[]
  addCompany: (company: Omit<Types.Company, 'id' | 'createdAt'>) => string
  updateCompany: (id: string, data: Partial<Types.Company>) => void
  deleteCompany: (id: string) => void

  // Employees
  employees: Types.Employee[]
  addEmployee: (employee: Omit<Types.Employee, 'id' | 'createdAt'>) => string
  updateEmployee: (id: string, data: Partial<Types.Employee>) => void
  deleteEmployee: (id: string) => void

  // Roles
  roles: Types.Role[]
  addRole: (role: Omit<Types.Role, 'id' | 'createdAt'>) => string
  updateRole: (id: string, data: Partial<Types.Role>) => void
  deleteRole: (id: string) => void

  // Customers
  customers: Types.Customer[]
  addCustomer: (customer: Omit<Types.Customer, 'id' | 'createdAt'>) => string
  updateCustomer: (id: string, data: Partial<Types.Customer>) => void
  deleteCustomer: (id: string) => void
  getCustomer: (id: string) => Types.Customer | undefined

  // Vehicles
  vehicles: Types.Vehicle[]
  addVehicle: (vehicle: Omit<Types.Vehicle, 'id' | 'createdAt'>) => string
  updateVehicle: (id: string, data: Partial<Types.Vehicle>) => void
  deleteVehicle: (id: string) => void
  getVehicle: (id: string) => Types.Vehicle | undefined
  getCustomerVehicles: (customerId: string) => Types.Vehicle[]

  // Vehicle Inspections
  vehicleInspections: Types.VehicleInspection[]
  addVehicleInspection: (inspection: Omit<Types.VehicleInspection, 'id' | 'createdAt'>) => string
  updateVehicleInspection: (id: string, data: Partial<Types.VehicleInspection>) => void
  getVehicleInspections: (vehicleId: string) => Types.VehicleInspection[]

  // Estimations
  estimations: Types.Estimation[]
  addEstimation: (estimation: Omit<Types.Estimation, 'id' | 'createdAt'>) => string
  updateEstimation: (id: string, data: Partial<Types.Estimation>) => void
  deleteEstimation: (id: string) => void
  getEstimation: (id: string) => Types.Estimation | undefined

  // Job Cards
  jobCards: Types.JobCard[]
  addJobCard: (jobCard: Omit<Types.JobCard, 'id' | 'createdAt'>) => string
  updateJobCard: (id: string, data: Partial<Types.JobCard>) => void
  deleteJobCard: (id: string) => void
  getJobCard: (id: string) => Types.JobCard | undefined
  getCustomerJobCards: (customerId: string) => Types.JobCard[]
  getVehicleJobCards: (vehicleId: string) => Types.JobCard[]
  getJobCardsByStatus: (status: string) => Types.JobCard[]

  // Appointments
  appointments: Types.Appointment[]
  addAppointment: (appointment: Omit<Types.Appointment, 'id' | 'createdAt'>) => string
  updateAppointment: (id: string, data: Partial<Types.Appointment>) => void
  deleteAppointment: (id: string) => void
  getAppointment: (id: string) => Types.Appointment | undefined
  getCustomerAppointments: (customerId: string) => Types.Appointment[]

  // Mechanics
  mechanics: Types.Mechanic[]
  addMechanic: (mechanic: Omit<Types.Mechanic, 'id' | 'createdAt'>) => string
  updateMechanic: (id: string, data: Partial<Types.Mechanic>) => void
  deleteMechanic: (id: string) => void
  getMechanic: (id: string) => Types.Mechanic | undefined

  // Parts
  parts: Types.Part[]
  addPart: (part: Omit<Types.Part, 'id' | 'createdAt'>) => string
  updatePart: (id: string, data: Partial<Types.Part>) => void
  deletePart: (id: string) => void
  getPart: (id: string) => Types.Part | undefined
  getLowStockParts: () => Types.Part[]

  // Stock Movements
  stockMovements: Types.StockMovement[]
  recordStockMovement: (movement: Omit<Types.StockMovement, 'id' | 'createdAt'>) => string

  // Suppliers
  suppliers: Types.Supplier[]
  addSupplier: (supplier: Omit<Types.Supplier, 'id' | 'createdAt'>) => string
  updateSupplier: (id: string, data: Partial<Types.Supplier>) => void
  deleteSupplier: (id: string) => void

  // Purchase Orders
  purchaseOrders: Types.PurchaseOrder[]
  addPurchaseOrder: (po: Omit<Types.PurchaseOrder, 'id' | 'createdAt'>) => string
  updatePurchaseOrder: (id: string, data: Partial<Types.PurchaseOrder>) => void
  deletePurchaseOrder: (id: string) => void

  // Invoices
  invoices: Types.Invoice[]
  addInvoice: (invoice: Omit<Types.Invoice, 'id' | 'createdAt'>) => string
  updateInvoice: (id: string, data: Partial<Types.Invoice>) => void
  deleteInvoice: (id: string) => void
  getInvoice: (id: string) => Types.Invoice | undefined
  getCustomerInvoices: (customerId: string) => Types.Invoice[]
  getJobCardInvoice: (jobCardId: string) => Types.Invoice | undefined

  // Payments
  payments: Types.Payment[]
  addPayment: (payment: Omit<Types.Payment, 'id' | 'createdAt'>) => string
  getInvoicePayments: (invoiceId: string) => Types.Payment[]

  // Notifications
  notifications: Types.Notification[]
  addNotification: (notification: Omit<Types.Notification, 'id' | 'createdAt'>) => string
  updateNotification: (id: string, data: Partial<Types.Notification>) => void
  markNotificationAsRead: (id: string, userId?: string) => void
  markAllNotificationsAsRead: (userId?: string) => void
  deleteNotification: (id: string) => void
  clearAllNotifications: () => void
  getUnreadNotifications: (userId?: string) => Types.Notification[]

  // Reviews
  reviews: Types.Review[]
  addReview: (review: Omit<Types.Review, 'id' | 'createdAt'>) => string
  updateReview: (id: string, data: Partial<Types.Review>) => void
  deleteReview: (id: string) => void

  // Expenses
  expenses: Types.Expense[]
  addExpense: (expense: Omit<Types.Expense, 'id' | 'createdAt'>) => string
  updateExpense: (id: string, data: Partial<Types.Expense>) => void
  deleteExpense: (id: string) => void

  // Generic module records for configuration-driven CRUD modules
  crudRecords: Record<string, Record<string, any>[]>
  addCrudRecord: (resource: string, record: Record<string, any>) => string
  updateCrudRecord: (resource: string, id: string, data: Record<string, any>) => void
  deleteCrudRecord: (resource: string, id: string) => void

  // Settings
  settings: Record<string, Types.GarageSettings>
  updateSettings: (companyId: string, settings: Partial<Types.GarageSettings>) => void
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const defaultCompanies: Types.Company[] = [
  {
    id: 'c1',
    name: 'GarageOS Auto Workshop',
    email: 'contact@garageos.com',
    phone: '+1 555-0192',
    address: '123 Main Street, Suite 100',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'c2',
    name: 'AutoFix Motors & Care',
    email: 'info@autofix.com',
    phone: '+1 555-0193',
    address: '456 Service Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'c3',
    name: 'FastLane Garage Ltd',
    email: 'support@fastlane.com',
    phone: '+1 555-0194',
    address: '789 Speed Way',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    createdAt: new Date('2025-01-01'),
  },
]

export const useGarageStore = create<GarageStore>()(
  persist(
    (set, get) => ({
      // Company
      currentCompanyId: 'c1',
      setCurrentCompanyId: (id) => set({ currentCompanyId: id }),
      companies: defaultCompanies,
      addCompany: (company) => {
        const id = generateId()
        set((state) => ({
          companies: [...state.companies, { ...company, id, createdAt: new Date() } as Types.Company],
        }))
        return id
      },
      updateCompany: (id, data) =>
        set((state) => ({
          companies: state.companies.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      deleteCompany: (id) =>
        set((state) => ({
          companies: state.companies.filter((c) => c.id !== id),
        })),

      // Employees
      employees: [],
      addEmployee: (employee) => {
        const id = generateId()
        set((state) => ({
          employees: [...state.employees, { ...employee, id, createdAt: new Date() } as Types.Employee],
        }))
        return id
      },
      updateEmployee: (id, data) =>
        set((state) => ({
          employees: state.employees.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),
      deleteEmployee: (id) =>
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== id),
        })),

      // Roles
      roles: [],
      addRole: (role) => {
        const id = generateId()
        set((state) => ({
          roles: [...state.roles, { ...role, id, createdAt: new Date() } as Types.Role],
        }))
        return id
      },
      updateRole: (id, data) =>
        set((state) => ({
          roles: state.roles.map((r) => (r.id === id ? { ...r, ...data } : r)),
        })),
      deleteRole: (id) =>
        set((state) => ({
          roles: state.roles.filter((r) => r.id !== id),
        })),

      // Customers
      customers: [],
      addCustomer: (customer) => {
        const id = generateId()
        set((state) => ({
          customers: [...state.customers, { ...customer, id, createdAt: new Date() } as Types.Customer],
        }))
        return id
      },
      updateCustomer: (id, data) =>
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      deleteCustomer: (id) =>
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        })),
      getCustomer: (id) => get().customers.find((c) => c.id === id),

      // Vehicles
      vehicles: [],
      addVehicle: (vehicle) => {
        const id = generateId()
        set((state) => ({
          vehicles: [...state.vehicles, { ...vehicle, id, createdAt: new Date() } as Types.Vehicle],
        }))
        return id
      },
      updateVehicle: (id, data) =>
        set((state) => ({
          vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...data } : v)),
        })),
      deleteVehicle: (id) =>
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== id),
        })),
      getVehicle: (id) => get().vehicles.find((v) => v.id === id),
      getCustomerVehicles: (customerId) => get().vehicles.filter((v) => v.customerId === customerId),

      // Vehicle Inspections
      vehicleInspections: [],
      addVehicleInspection: (inspection) => {
        const id = generateId()
        set((state) => ({
          vehicleInspections: [...state.vehicleInspections, { ...inspection, id, createdAt: new Date() } as Types.VehicleInspection],
        }))
        return id
      },
      updateVehicleInspection: (id, data) =>
        set((state) => ({
          vehicleInspections: state.vehicleInspections.map((i) => (i.id === id ? { ...i, ...data } : i)),
        })),
      getVehicleInspections: (vehicleId) =>
        get().vehicleInspections.filter((i) => i.vehicleId === vehicleId),

      // Estimations
      estimations: [],
      addEstimation: (estimation) => {
        const id = generateId()
        set((state) => ({
          estimations: [...state.estimations, { ...estimation, id, createdAt: new Date() } as Types.Estimation],
        }))
        return id
      },
      updateEstimation: (id, data) =>
        set((state) => ({
          estimations: state.estimations.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),
      deleteEstimation: (id) =>
        set((state) => ({
          estimations: state.estimations.filter((e) => e.id !== id),
        })),
      getEstimation: (id) => get().estimations.find((e) => e.id === id),

      // Job Cards
      jobCards: [],
      addJobCard: (jobCard) => {
        const id = generateId()
        set((state) => ({
          jobCards: [...state.jobCards, { ...jobCard, id, createdAt: new Date() } as Types.JobCard],
        }))
        return id
      },
      updateJobCard: (id, data) =>
        set((state) => ({
          jobCards: state.jobCards.map((j) => (j.id === id ? { ...j, ...data } : j)),
        })),
      deleteJobCard: (id) =>
        set((state) => ({
          jobCards: state.jobCards.filter((j) => j.id !== id),
        })),
      getJobCard: (id) => get().jobCards.find((j) => j.id === id),
      getCustomerJobCards: (customerId) => get().jobCards.filter((j) => j.customerId === customerId),
      getVehicleJobCards: (vehicleId) => get().jobCards.filter((j) => j.vehicleId === vehicleId),
      getJobCardsByStatus: (status) => get().jobCards.filter((j) => j.status === status),

      // Appointments
      appointments: [],
      addAppointment: (appointment) => {
        const id = generateId()
        set((state) => ({
          appointments: [...state.appointments, { ...appointment, id, createdAt: new Date() } as Types.Appointment],
        }))
        return id
      },
      updateAppointment: (id, data) =>
        set((state) => ({
          appointments: state.appointments.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),
      deleteAppointment: (id) =>
        set((state) => ({
          appointments: state.appointments.filter((a) => a.id !== id),
        })),
      getAppointment: (id) => get().appointments.find((a) => a.id === id),
      getCustomerAppointments: (customerId) =>
        get().appointments.filter((a) => a.customerId === customerId),

      // Mechanics
      mechanics: [],
      addMechanic: (mechanic) => {
        const id = generateId()
        set((state) => ({
          mechanics: [...state.mechanics, { ...mechanic, id, createdAt: new Date() } as Types.Mechanic],
        }))
        return id
      },
      updateMechanic: (id, data) =>
        set((state) => ({
          mechanics: state.mechanics.map((m) => (m.id === id ? { ...m, ...data } : m)),
        })),
      deleteMechanic: (id) =>
        set((state) => ({
          mechanics: state.mechanics.filter((m) => m.id !== id),
        })),
      getMechanic: (id) => get().mechanics.find((m) => m.id === id),

      // Parts
      parts: [],
      addPart: (part) => {
        const id = generateId()
        set((state) => ({
          parts: [...state.parts, { ...part, id, createdAt: new Date() } as Types.Part],
        }))
        return id
      },
      updatePart: (id, data) =>
        set((state) => ({
          parts: state.parts.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      deletePart: (id) =>
        set((state) => ({
          parts: state.parts.filter((p) => p.id !== id),
        })),
      getPart: (id) => get().parts.find((p) => p.id === id),
      getLowStockParts: () => get().parts.filter((p) => p.quantity < p.minStock),

      // Stock Movements
      stockMovements: [],
      recordStockMovement: (movement) => {
        const id = generateId()
        const store = get()
        const part = store.parts.find((p) => p.id === movement.partId)

        if (part) {
          const newQuantity = movement.type === 'in' ? part.quantity + movement.quantity : part.quantity - movement.quantity
          store.updatePart(part.id, { quantity: Math.max(0, newQuantity) })
        }

        set((state) => ({
          stockMovements: [...state.stockMovements, { ...movement, id, createdAt: new Date() } as Types.StockMovement],
        }))
        return id
      },

      // Suppliers
      suppliers: [],
      addSupplier: (supplier) => {
        const id = generateId()
        set((state) => ({
          suppliers: [...state.suppliers, { ...supplier, id, createdAt: new Date() } as Types.Supplier],
        }))
        return id
      },
      updateSupplier: (id, data) =>
        set((state) => ({
          suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),
      deleteSupplier: (id) =>
        set((state) => ({
          suppliers: state.suppliers.filter((s) => s.id !== id),
        })),

      // Purchase Orders
      purchaseOrders: [],
      addPurchaseOrder: (po) => {
        const id = generateId()
        set((state) => ({
          purchaseOrders: [...state.purchaseOrders, { ...po, id, createdAt: new Date() } as Types.PurchaseOrder],
        }))
        return id
      },
      updatePurchaseOrder: (id, data) =>
        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      deletePurchaseOrder: (id) =>
        set((state) => ({
          purchaseOrders: state.purchaseOrders.filter((p) => p.id !== id),
        })),

      // Invoices
      invoices: [],
      addInvoice: (invoice) => {
        const id = generateId()
        set((state) => ({
          invoices: [...state.invoices, { ...invoice, id, createdAt: new Date() } as Types.Invoice],
        }))
        return id
      },
      updateInvoice: (id, data) =>
        set((state) => ({
          invoices: state.invoices.map((i) => (i.id === id ? { ...i, ...data } : i)),
        })),
      deleteInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.filter((i) => i.id !== id),
        })),
      getInvoice: (id) => get().invoices.find((i) => i.id === id),
      getCustomerInvoices: (customerId) => get().invoices.filter((i) => i.customerId === customerId),
      getJobCardInvoice: (jobCardId) => get().invoices.find((i) => i.jobCardId === jobCardId),

      // Payments
      payments: [],
      addPayment: (payment) => {
        const id = generateId()
        const store = get()
        const invoice = store.invoices.find((i) => i.id === payment.invoiceId)

        if (invoice) {
          const newAmountPaid = invoice.amountPaid + (payment.paidAmount ?? payment.amount)
          const newStatus =
            newAmountPaid >= invoice.total
              ? 'paid'
              : newAmountPaid > 0
                ? 'partially-paid'
                : 'unpaid'
          store.updateInvoice(invoice.id, {
            amountPaid: newAmountPaid,
            status: newStatus as any,
            paymentStatus: payment.paymentStatus === 'verified' ? 'completed' : 'pending',
          })
        }

        set((state) => ({
          payments: [...state.payments, { ...payment, id, createdAt: new Date() } as Types.Payment],
        }))
        return id
      },
      getInvoicePayments: (invoiceId) => get().payments.filter((p) => p.invoiceId === invoiceId),

      // Notifications
      notifications: [],
      addNotification: (notification) => {
        const id = generateId()
        set((state) => ({
          notifications: [...state.notifications, { ...notification, id, status: notification.status ?? 1, reads: [], createdAt: new Date() } as Types.Notification],
        }))
        return id
      },
      updateNotification: (id, data) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? { ...notification, ...data } : notification,
          ),
        })),
      markNotificationAsRead: (id, userId = 'anonymous') =>
        set((state) => ({
          notifications: state.notifications.map((notification) => {
            if (notification.id !== id) return notification
            const reads = notification.reads ?? []
            const existing = reads.find((read) => read.userId === userId)
            return {
              ...notification,
              read: userId === 'anonymous' ? true : notification.read,
              reads: existing
                ? reads.map((read) => read.userId === userId ? { ...read, isRead: true, readAt: new Date() } : read)
                : [...reads, { notificationId: id, userId, isRead: true, readAt: new Date() }],
            }
          }),
        })),
      markAllNotificationsAsRead: (userId = 'anonymous') =>
        set((state) => ({
          notifications: state.notifications.map((notification) => {
            const reads = notification.reads ?? []
            if (userId === 'anonymous') return { ...notification, read: true }
            const existing = reads.find((read) => read.userId === userId)
            return {
              ...notification,
              reads: existing
                ? reads.map((read) => read.userId === userId ? { ...read, isRead: true, readAt: new Date() } : read)
                : [...reads, { notificationId: notification.id, userId, isRead: true, readAt: new Date() }],
            }
          }),
        })),
      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearAllNotifications: () =>
        set((state) => ({
          notifications: state.notifications.filter((n) => !n.read),
        })),
      getUnreadNotifications: (userId = 'anonymous') => get().notifications.filter((notification) => {
        if (notification.status === 0) return false
        if (userId === 'anonymous') return !notification.read
        return !notification.reads?.some((read) => read.userId === userId && read.isRead)
      }),

      // Reviews
      reviews: [],
      addReview: (review) => {
        const id = generateId()
        set((state) => ({ reviews: [...state.reviews, { ...review, id, createdAt: new Date() } as Types.Review] }))
        return id
      },
      updateReview: (id, data) => set((state) => ({ reviews: state.reviews.map((review) => review.id === id ? { ...review, ...data } : review) })),
      deleteReview: (id) => set((state) => ({ reviews: state.reviews.filter((review) => review.id !== id) })),

      // Expenses
      expenses: [],
      addExpense: (expense) => {
        const id = generateId()
        set((state) => ({ expenses: [...state.expenses, { ...expense, id, createdAt: new Date() } as Types.Expense] }))
        return id
      },
      updateExpense: (id, data) => set((state) => ({ expenses: state.expenses.map((expense) => expense.id === id ? { ...expense, ...data } : expense) })),
      deleteExpense: (id) => set((state) => ({ expenses: state.expenses.filter((expense) => expense.id !== id) })),

      // Generic module records
      crudRecords: {},
      addCrudRecord: (resource, record) => {
        const id = generateId()
        set((state) => ({ crudRecords: { ...state.crudRecords, [resource]: [...(state.crudRecords[resource] ?? []), { ...record, id, createdAt: new Date() }] } }))
        return id
      },
      updateCrudRecord: (resource, id, data) => set((state) => ({ crudRecords: { ...state.crudRecords, [resource]: (state.crudRecords[resource] ?? []).map((record) => record.id === id ? { ...record, ...data, updatedAt: new Date() } : record) } })),
      deleteCrudRecord: (resource, id) => set((state) => ({ crudRecords: { ...state.crudRecords, [resource]: (state.crudRecords[resource] ?? []).filter((record) => record.id !== id) } })),

      // Settings
      settings: {},
      updateSettings: (companyId, newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [companyId]: { ...state.settings[companyId], ...newSettings },
          },
        })),
    }),
    {
      name: 'garage-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
