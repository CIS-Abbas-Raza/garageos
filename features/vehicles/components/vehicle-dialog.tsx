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
      <DialogContent className="sm:max-w-[650px] bg-white p-6 rounded-xl border border-slate-200 shadow-xl gap-0">
        <DialogHeader className="space-y-1 mb-6">
          <DialogTitle className="text-xl font-bold text-slate-900">
            {mode === "add" ? "Add Vehicle" : "Edit Vehicle"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 font-normal">
            {mode === "add"
              ? "Create a new vehicle entry."
              : "Make changes to the vehicle details."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="make" className="text-sm font-semibold text-slate-700">Make *</Label>
              <Input
                id="make"
                {...form.register("make")}
                className="h-10 border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors"
                placeholder="Toyota"
              />
              {form.formState.errors.make && (
                <p className="text-xs text-red-500">{form.formState.errors.make.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model" className="text-sm font-semibold text-slate-700">Model *</Label>
              <Input
                id="model"
                {...form.register("model")}
                className="h-10 border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors"
                placeholder="Camry"
              />
              {form.formState.errors.model && (
                <p className="text-xs text-red-500">{form.formState.errors.model.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="year" className="text-sm font-semibold text-slate-700">Year *</Label>
              <Input
                id="year"
                type="number"
                {...form.register("year", { valueAsNumber: true })}
                className="h-10 border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors"
                placeholder="YYYY"
              />
              {form.formState.errors.year && (
                <p className="text-xs text-red-500">{form.formState.errors.year.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mileage" className="text-sm font-semibold text-slate-700">Mileage (km) *</Label>
              <Input
                id="mileage"
                type="number"
                {...form.register("mileage", { valueAsNumber: true })}
                className="h-10 border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors"
                placeholder="0"
              />
              {form.formState.errors.mileage && (
                <p className="text-xs text-red-500">{form.formState.errors.mileage.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="licensePlate" className="text-sm font-semibold text-slate-700">License Plate *</Label>
              <Input
                id="licensePlate"
                {...form.register("licensePlate")}
                className="h-10 border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors"
                placeholder="Enter license plate"
              />
              {form.formState.errors.licensePlate && (
                <p className="text-xs text-red-500">{form.formState.errors.licensePlate.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vin" className="text-sm font-semibold text-slate-700">VIN *</Label>
              <Input
                id="vin"
                {...form.register("vin")}
                className="h-10 border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors"
                placeholder="Enter VIN"
              />
              {form.formState.errors.vin && (
                <p className="text-xs text-red-500">{form.formState.errors.vin.message}</p>
              )}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="color" className="text-sm font-semibold text-slate-700">Color</Label>
              <Input
                id="color"
                {...form.register("color")}
                className="h-10 border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors"
                placeholder="Enter color"
              />
            </div>
          </div>
          <div className="border-t border-slate-200/80 -mx-6 pt-4 px-6 flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 h-10 px-4 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 px-4 rounded-lg transition-colors"
            >
              {mode === "add" ? "Create Vehicle" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
