'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { Button } from '@/components/ui/button'
import { useVehicles } from '@/lib/hooks/use-crud'
import { VehicleDialog } from '@/components/dialogs/vehicle-dialog'
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirm'
import { EmptyState } from '@/components/empty-state'
import { Search, Plus, Edit, Trash2, Car } from 'lucide-react'

export default function VehiclesPage() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useVehicles()

  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  })

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.includes(searchTerm.toUpperCase())
  )

  const handleAddClick = () => {
    setEditingVehicle(null)
    setIsDialogOpen(true)
  }

  const handleEditClick = (vehicle: any) => {
    setEditingVehicle(vehicle)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ open: true, id })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirm.id) {
      deleteVehicle(deleteConfirm.id)
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const handleSaveVehicle = (data: any) => {
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, data)
    } else {
      addVehicle(data)
    }
    setIsDialogOpen(false)
    setEditingVehicle(null)
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Vehicles" />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Vehicles</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Track and manage all customer vehicles
                </p>
              </div>
              <Button
                onClick={handleAddClick}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search by make, model, or license plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Vehicles Grid */}
            {filteredVehicles.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="border border-border rounded-lg bg-card p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Car className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.licensePlate}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditClick(vehicle)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 text-primary" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(vehicle.id)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {vehicle.color && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Color:</span>
                          <span className="text-foreground font-medium">{vehicle.color}</span>
                        </div>
                      )}
                      {vehicle.mileage && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mileage:</span>
                          <span className="text-foreground font-medium">{vehicle.mileage} miles</span>
                        </div>
                      )}
                      {vehicle.vin && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">VIN:</span>
                          <span className="text-foreground font-medium text-xs">{vehicle.vin}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No vehicles yet"
                description="Get started by adding your first vehicle"
                action={{
                  label: 'Add Vehicle',
                  onClick: handleAddClick,
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <VehicleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        vehicle={editingVehicle}
        onSave={handleSaveVehicle}
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirm.open}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Vehicle"
        description="Are you sure you want to delete this vehicle? This action cannot be undone."
      />
    </div>
  )
}
