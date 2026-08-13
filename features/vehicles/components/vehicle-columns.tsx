"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Vehicle } from "@/lib/types/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Pencil, Trash } from "lucide-react"

export function createVehicleColumns(
  onView: (vehicle: Vehicle) => void,
  onEdit?: (vehicle: Vehicle) => void,
  onDelete?: (vehicle: Vehicle) => void
): ColumnDef<Vehicle>[] {
  return [
    {
      accessorKey: "make",
      header: "Make & Model",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.original.make} {row.original.model}</span>
          <span className="text-xs text-gray-500">{row.original.year}</span>
        </div>
      ),
    },
    {
      accessorKey: "licensePlate",
      header: "License Plate",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono bg-gray-50 text-gray-700 border-gray-200">
          {row.original.licensePlate}
        </Badge>
      ),
    },
    {
      accessorKey: "vin",
      header: "VIN",
      cell: ({ row }) => <span className="text-sm font-mono text-gray-500">{row.original.vin}</span>,
    },
    {
      accessorKey: "mileage",
      header: "Mileage",
      cell: ({ row }) => <span className="text-sm">{row.original.mileage.toLocaleString()} km</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const vehicle = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] bg-white">
              <DropdownMenuLabel className="text-xs font-bold uppercase text-gray-500">Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(vehicle)} className="text-[13px] cursor-pointer gap-2">
                <Eye className="h-4 w-4" /> View Details
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(vehicle)} className="text-[13px] cursor-pointer gap-2">
                  <Pencil className="h-4 w-4" /> Edit Vehicle
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(vehicle)} className="text-[13px] cursor-pointer text-red-600 focus:text-red-600 gap-2">
                  <Trash className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
