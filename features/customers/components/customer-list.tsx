"use client"

import { useState } from "react"
import { Users, Plus } from "lucide-react"
import { toast } from "sonner"
import type { Customer } from "@/lib/types/store"
import { useGarageStore } from "@/lib/store/garage-store"
import { useModulePermissions } from "@/lib/hooks/use-module-permissions"
import { MODULE_RESOURCE } from "../permissions"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { createCustomerColumns } from "./customer-columns"
import { CustomerDialog } from "./customer-dialog"

export function CustomerList() {
  const { canCreate, canUpdate, canDelete } = useModulePermissions(MODULE_RESOURCE)
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useGarageStore()
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsEditOpen(true)
  }

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsEditOpen(true)
  }

  const handleDelete = (customer: Customer) => {
    if (confirm(`Are you sure you want to delete ${customer.firstName} ${customer.lastName}?`)) {
      deleteCustomer(customer.id)
      toast.success("Customer deleted successfully.")
    }
  }

  const handleAddSubmit = (data: any) => {
    addCustomer(data)
    toast.success("Customer created successfully.")
  }

  const handleUpdateSubmit = (data: any) => {
    if (data.id) {
      updateCustomer(data.id, data)
      toast.success("Customer updated successfully.")
    }
  }

  const columns = createCustomerColumns(
    handleView, 
    canUpdate ? handleEdit : undefined, 
    canDelete ? handleDelete : undefined
  )

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start justify-between shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            <h1 className="text-[20px] md:text-[28px] font-bold text-gray-900 tracking-tight">Customers</h1>
          </div>
          <p className="text-[13px] md:text-[14px] text-gray-400 font-medium">Manage your client base and contact details</p>
        </div>
        {canCreate && (
          <Button
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg gap-2 shadow-sm h-auto font-bold text-[14px] w-full md:w-auto justify-center"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="h-4.5 w-4.5" />
            Add Customer
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchKey="firstName"
        searchPlaceholder="Search customers by name..."
        enableViewToggle={false}
        totalCounts={{
          total: customers.length,
        }}
      />

      {canCreate && (
        <CustomerDialog 
          open={isAddOpen} 
          onOpenChange={setIsAddOpen} 
          mode="add" 
          onSubmit={handleAddSubmit} 
        />
      )}

      {canUpdate && (
        <CustomerDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          customer={selectedCustomer || undefined}
          mode="edit"
          onSubmit={handleUpdateSubmit}
        />
      )}
    </div>
  )
}
