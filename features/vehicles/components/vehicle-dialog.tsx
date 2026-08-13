"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { Vehicle } from "@/lib/types/store"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGarageStore } from "@/lib/store/garage-store"

const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  vin: z.string().min(1, "VIN is required"),
  licensePlate: z.string().min(1, "License plate is required"),
  mileage: z.number().min(0),
  color: z.string().optional(),
})

type VehicleFormValues = z.infer<typeof vehicleSchema>

interface VehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: Vehicle
  mode: "add" | "edit"
  onSubmit: (data: VehicleFormValues & { id?: string, companyId: string, customerId: string }) => void
}

export function VehicleDialog({ open, onOpenChange, vehicle, mode, onSubmit }: VehicleDialogProps) {
  const { currentCompanyId } = useGarageStore()
  
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      vin: "",
      licensePlate: "",
      mileage: 0,
      color: "",
    },
  })

  useEffect(() => {
    if (open && vehicle && mode === "edit") {
      form.reset({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin,
        licensePlate: vehicle.licensePlate,
        mileage: vehicle.mileage,
        color: vehicle.color || "",
      })
    } else if (open && mode === "add") {
      form.reset({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        vin: "",
        licensePlate: "",
        mileage: 0,
        color: "",
      })
    }
  }, [open, vehicle, mode, form])

  const handleSubmit = form.handleSubmit((data) => {
    // In a real app we'd also pick customerId from a dropdown
    onSubmit({
      ...data,
      id: vehicle?.id,
      companyId: currentCompanyId,
      customerId: vehicle?.customerId || "cust-mock", 
    })
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Vehicle" : "Edit Vehicle"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Enter the details of the new vehicle." : "Make changes to the vehicle details."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make *</Label>
              <Input id="make" {...form.register("make")} />
              {form.formState.errors.make && <p className="text-xs text-red-500">{form.formState.errors.make.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input id="model" {...form.register("model")} />
              {form.formState.errors.model && <p className="text-xs text-red-500">{form.formState.errors.model.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input id="year" type="number" {...form.register("year", { valueAsNumber: true })} />
              {form.formState.errors.year && <p className="text-xs text-red-500">{form.formState.errors.year.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage (km) *</Label>
              <Input id="mileage" type="number" {...form.register("mileage", { valueAsNumber: true })} />
              {form.formState.errors.mileage && <p className="text-xs text-red-500">{form.formState.errors.mileage.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate *</Label>
              <Input id="licensePlate" {...form.register("licensePlate")} />
              {form.formState.errors.licensePlate && <p className="text-xs text-red-500">{form.formState.errors.licensePlate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vin">VIN *</Label>
              <Input id="vin" {...form.register("vin")} />
              {form.formState.errors.vin && <p className="text-xs text-red-500">{form.formState.errors.vin.message}</p>}
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input id="color" {...form.register("color")} />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {mode === "add" ? "Create Vehicle" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
