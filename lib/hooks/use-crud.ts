'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { useGarageStore } from '@/lib/store/garage-store'

export function useCrud() {
  const store = useGarageStore()

  const handleCreate = useCallback(
    (
      action: () => string,
      entityName: string
    ) => {
      try {
        action()
        toast.success(`${entityName} created successfully`)
        return true
      } catch (error) {
        toast.error(`Failed to create ${entityName}`)
        return false
      }
    },
    []
  )

  const handleUpdate = useCallback(
    (
      action: () => void,
      entityName: string
    ) => {
      try {
        action()
        toast.success(`${entityName} updated successfully`)
        return true
      } catch (error) {
        toast.error(`Failed to update ${entityName}`)
        return false
      }
    },
    []
  )

  const handleDelete = useCallback(
    (
      action: () => void,
      entityName: string
    ) => {
      try {
        action()
        toast.success(`${entityName} deleted successfully`)
        return true
      } catch (error) {
        toast.error(`Failed to delete ${entityName}`)
        return false
      }
    },
    []
  )

  return { handleCreate, handleUpdate, handleDelete }
}

export function useCustomers() {
  const store = useGarageStore()
  const { handleCreate, handleUpdate, handleDelete } = useCrud()

  return {
    customers: store.customers,
    addCustomer: (data: any) => handleCreate(() => store.addCustomer(data), 'Customer'),
    updateCustomer: (id: string, data: any) => handleUpdate(() => store.updateCustomer(id, data), 'Customer'),
    deleteCustomer: (id: string) => handleDelete(() => store.deleteCustomer(id), 'Customer'),
    getCustomer: (id: string) => store.getCustomer(id),
  }
}

export function useVehicles() {
  const store = useGarageStore()
  const { handleCreate, handleUpdate, handleDelete } = useCrud()

  return {
    vehicles: store.vehicles,
    addVehicle: (data: any) => handleCreate(() => store.addVehicle(data), 'Vehicle'),
    updateVehicle: (id: string, data: any) => handleUpdate(() => store.updateVehicle(id, data), 'Vehicle'),
    deleteVehicle: (id: string) => handleDelete(() => store.deleteVehicle(id), 'Vehicle'),
    getVehicle: (id: string) => store.getVehicle(id),
    getCustomerVehicles: (customerId: string) => store.getCustomerVehicles(customerId),
  }
}

export function useJobCards() {
  const store = useGarageStore()
  const { handleCreate, handleUpdate, handleDelete } = useCrud()

  return {
    jobCards: store.jobCards,
    addJobCard: (data: any) => handleCreate(() => store.addJobCard(data), 'Job Card'),
    updateJobCard: (id: string, data: any) => handleUpdate(() => store.updateJobCard(id, data), 'Job Card'),
    deleteJobCard: (id: string) => handleDelete(() => store.deleteJobCard(id), 'Job Card'),
    getJobCard: (id: string) => store.getJobCard(id),
    getCustomerJobCards: (customerId: string) => store.getCustomerJobCards(customerId),
    getVehicleJobCards: (vehicleId: string) => store.getVehicleJobCards(vehicleId),
    getJobCardsByStatus: (status: string) => store.getJobCardsByStatus(status),
  }
}

export function useAppointments() {
  const store = useGarageStore()
  const { handleCreate, handleUpdate, handleDelete } = useCrud()

  return {
    appointments: store.appointments,
    addAppointment: (data: any) => handleCreate(() => store.addAppointment(data), 'Appointment'),
    updateAppointment: (id: string, data: any) => handleUpdate(() => store.updateAppointment(id, data), 'Appointment'),
    deleteAppointment: (id: string) => handleDelete(() => store.deleteAppointment(id), 'Appointment'),
    getAppointment: (id: string) => store.getAppointment(id),
    getCustomerAppointments: (customerId: string) => store.getCustomerAppointments(customerId),
  }
}

export function useMechanics() {
  const store = useGarageStore()
  const { handleCreate, handleUpdate, handleDelete } = useCrud()

  return {
    mechanics: store.mechanics,
    addMechanic: (data: any) => handleCreate(() => store.addMechanic(data), 'Mechanic'),
    updateMechanic: (id: string, data: any) => handleUpdate(() => store.updateMechanic(id, data), 'Mechanic'),
    deleteMechanic: (id: string) => handleDelete(() => store.deleteMechanic(id), 'Mechanic'),
    getMechanic: (id: string) => store.getMechanic(id),
  }
}

export function useParts() {
  const store = useGarageStore()
  const { handleCreate, handleUpdate, handleDelete } = useCrud()

  return {
    parts: store.parts,
    addPart: (data: any) => handleCreate(() => store.addPart(data), 'Part'),
    updatePart: (id: string, data: any) => handleUpdate(() => store.updatePart(id, data), 'Part'),
    deletePart: (id: string) => handleDelete(() => store.deletePart(id), 'Part'),
    getPart: (id: string) => store.getPart(id),
    getLowStockParts: () => store.getLowStockParts(),
  }
}

export function useInvoices() {
  const store = useGarageStore()
  const { handleCreate, handleUpdate, handleDelete } = useCrud()

  return {
    invoices: store.invoices,
    addInvoice: (data: any) => handleCreate(() => store.addInvoice(data), 'Invoice'),
    updateInvoice: (id: string, data: any) => handleUpdate(() => store.updateInvoice(id, data), 'Invoice'),
    deleteInvoice: (id: string) => handleDelete(() => store.deleteInvoice(id), 'Invoice'),
    getInvoice: (id: string) => store.getInvoice(id),
    getCustomerInvoices: (customerId: string) => store.getCustomerInvoices(customerId),
    getJobCardInvoice: (jobCardId: string) => store.getJobCardInvoice(jobCardId),
  }
}

export function usePayments() {
  const store = useGarageStore()
  const { handleCreate } = useCrud()

  return {
    payments: store.payments,
    addPayment: (data: any) => handleCreate(() => store.addPayment(data), 'Payment'),
    getInvoicePayments: (invoiceId: string) => store.getInvoicePayments(invoiceId),
  }
}
