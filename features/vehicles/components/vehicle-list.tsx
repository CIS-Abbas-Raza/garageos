"use client"

import { useState } from "react"
import { Truck, Plus } from "lucide-react"
import { toast } from "sonner"
import type { Vehicle } from "@/lib/types/store"
import { useGarageStore } from "@/lib/store/garage-store"
import { useModulePermissions } from "@/lib/hooks/use-module-permissions"
import { MODULE_RESOURCE } from "../permissions"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { createVehicleColumns } from "./vehicle-columns"
import { VehicleDialog } from "./vehicle-dialog"

export function VehicleList() {
  const { canCreate, canUpdate, canDelete } = useModulePermissions(MODULE_RESOURCE)
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useGarageStore()
  
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // In a real app we'd have a View Dialog. Using Edit for now to simplify.
  const handleView = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsEditOpen(true)
  }

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsEditOpen(true)
  }

  const handleDelete = (vehicle: Vehicle) => {
    if (confirm(`Are you sure you want to delete ${vehicle.make} ${vehicle.model}?`)) {
      deleteVehicle(vehicle.id)
      toast.success("Vehicle deleted successfully.")
    }
  }

  const handleAddSubmit = (data: any) => {
    addVehicle(data)
    toast.success("Vehicle created successfully.")
  }

  const handleUpdateSubmit = (data: any) => {
    if (data.id) {
      updateVehicle(data.id, data)
      toast.success("Vehicle updated successfully.")
    }
  }

  const columns = createVehicleColumns(
    handleView, 
    canUpdate ? handleEdit : undefined, 
    canDelete ? handleDelete : undefined
  )

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start justify-between shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Truck className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            <h1 className="text-[20px] md:text-[28px] font-bold text-gray-900 tracking-tight">Vehicles</h1>
          </div>
          <p className="text-[13px] md:text-[14px] text-gray-400 font-medium">Manage customer vehicles and histories</p>
        </div>
        {canCreate && (
          <Button
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg gap-2 shadow-sm h-auto font-bold text-[14px] w-full md:w-auto justify-center"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="h-4.5 w-4.5" />
            Add Vehicle
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        searchKey="make"
        searchPlaceholder="Search vehicles by make..."
        enableViewToggle={false}
        totalCounts={{
          total: vehicles.length,
        }}
      />

      {canCreate && (
        <VehicleDialog 
          open={isAddOpen} 
          onOpenChange={setIsAddOpen} 
          mode="add" 
          onSubmit={handleAddSubmit} 
        />
      )}

      {canUpdate && (
        <VehicleDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          vehicle={selectedVehicle || undefined}
          mode="edit"
          onSubmit={handleUpdateSubmit}
        />
      )}
    </div>
  )
}
