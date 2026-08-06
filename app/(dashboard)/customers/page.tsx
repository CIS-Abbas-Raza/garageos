'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { useCustomers } from '@/lib/hooks/use-crud'
import { CustomerDialog } from '@/components/dialogs/customer-dialog'
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirm'
import { EmptyState } from '@/components/empty-state'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers()

  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  })

  const filteredCustomers = customers.filter(
    (customer) =>
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  )

  const handleAddClick = () => {
    setEditingCustomer(null)
    setIsDialogOpen(true)
  }

  const handleEditClick = (customer: any) => {
    setEditingCustomer(customer)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ open: true, id })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirm.id) {
      deleteCustomer(deleteConfirm.id)
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const handleSaveCustomer = (data: any) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, data)
    } else {
      addCustomer(data)
    }
    setIsDialogOpen(false)
    setEditingCustomer(null)
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Customers" />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Customers</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your customer information and contact details
                </p>
              </div>
              <button
                onClick={handleAddClick}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Customer
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Customers Table */}
            {filteredCustomers.length > 0 ? (
              <div className="border border-border rounded-lg bg-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Phone
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                        Address
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="border-b border-border hover:bg-muted/10 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-foreground font-medium">
                          {customer.firstName} {customer.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {customer.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {customer.phone}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {customer.address}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(customer)}
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4 text-primary" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(customer.id)}
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No customers yet"
                description="Get started by adding your first customer"
                action={{
                  label: 'Add Customer',
                  onClick: handleAddClick,
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <CustomerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={editingCustomer}
        onSave={handleSaveCustomer}
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirm.open}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        description="Are you sure you want to delete this customer? This action cannot be undone."
      />
    </div>
  )
}
