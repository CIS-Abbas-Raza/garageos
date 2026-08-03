'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface VehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle?: any
  onSave: (data: any) => void
}

export function VehicleDialog({
  open,
  onOpenChange,
  vehicle,
  onSave,
}: VehicleDialogProps) {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    vin: '',
    licensePlate: '',
    customerId: '',
    color: '',
    mileage: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (vehicle) {
      setFormData(vehicle)
    } else {
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear().toString(),
        vin: '',
        licensePlate: '',
        customerId: '',
        color: '',
        mileage: '',
      })
    }
    setErrors({})
  }, [vehicle, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.make.trim()) {
      newErrors.make = 'Make is required'
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required'
    }
    if (!formData.year) {
      newErrors.year = 'Year is required'
    }
    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {vehicle ? 'Edit Vehicle' : 'Add Vehicle'}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Make
              </label>
              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.make ? 'border-destructive' : 'border-border'
                }`}
                placeholder="Toyota"
              />
              {errors.make && (
                <p className="text-xs text-destructive mt-1">{errors.make}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.model ? 'border-destructive' : 'border-border'
                }`}
                placeholder="Camry"
              />
              {errors.model && (
                <p className="text-xs text-destructive mt-1">{errors.model}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.year ? 'border-destructive' : 'border-border'
                }`}
                placeholder="2020"
              />
              {errors.year && (
                <p className="text-xs text-destructive mt-1">{errors.year}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Black"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              License Plate
            </label>
            <input
              type="text"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.licensePlate ? 'border-destructive' : 'border-border'
              }`}
              placeholder="ABC-1234"
            />
            {errors.licensePlate && (
              <p className="text-xs text-destructive mt-1">{errors.licensePlate}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              VIN
            </label>
            <input
              type="text"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Vehicle Identification Number"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Mileage
            </label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="50000"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              {vehicle ? 'Update' : 'Add'} Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
