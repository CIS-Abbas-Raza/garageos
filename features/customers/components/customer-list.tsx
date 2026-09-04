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
import { ConfirmDeleteModal } from "@/components/common/confirm-delete-modal"
import { createCustomerColumns } from "./customer-columns"
import { CustomerDialog } from "./customer-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function CustomerList() {
  const { canCreate, canUpdate, canDelete } = useModulePermissions(MODULE_RESOURCE)
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useGarageStore()
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [resettingCustomer, setResettingCustomer] = useState<Customer | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsEditOpen(true)
  }

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsEditOpen(true)
  }

  const handleDelete = (customer: Customer) => {
    setDeletingCustomer(customer)
  }

  const handleResetPassword = async () => {
    if (!resettingCustomer) return
    setIsResetting(true)
    try {
      const response = await fetch(`/backend-api/customers/${resettingCustomer.id}/reset-password`, {
        method: "POST",
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || "Failed to reset password")
      }
      toast.success("Password reset successfully. New password is garageCustomer@123")
      setResettingCustomer(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reset password.")
    } finally {
      setIsResetting(false)
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
    canDelete ? handleDelete : undefined,
    canUpdate ? (customer) => setResettingCustomer(customer) : undefined
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

      <ConfirmDeleteModal
        open={Boolean(deletingCustomer)}
        onOpenChange={(open) => !open && setDeletingCustomer(null)}
        title="Delete customer?"
        message={`Are you sure you want to delete ${deletingCustomer?.firstName ?? "this"} ${deletingCustomer?.lastName ?? "customer"}? This action cannot be undone.`}
        successMessage="Customer deleted successfully."
        onConfirm={() => {
          if (deletingCustomer) deleteCustomer(deletingCustomer.id)
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

      <Dialog open={Boolean(resettingCustomer)} onOpenChange={(open) => !open && setResettingCustomer(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset password?
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm text-gray-600">
              New password will be{" "}
              <code className="rounded bg-slate-100 px-2 py-1 font-mono text-sm font-semibold text-slate-900 border border-slate-200">
                garageCustomer@123
              </code>
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResettingCustomer(null)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleResetPassword}
              disabled={isResetting}
            >
              {isResetting ? "Resetting..." : "Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
