'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface JobCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobCard?: any
  onSave: (data: any) => void
}

const JOB_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function JobCardDialog({
  open,
  onOpenChange,
  jobCard,
  onSave,
}: JobCardDialogProps) {
  const [formData, setFormData] = useState({
    description: '',
    status: 'pending',
    estimatedHours: '',
    actualHours: '',
    assignedMechanic: '',
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (jobCard) {
      setFormData(jobCard)
    } else {
      setFormData({
        description: '',
        status: 'pending',
        estimatedHours: '',
        actualHours: '',
        assignedMechanic: '',
        notes: '',
      })
    }
    setErrors({})
  }, [jobCard, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.estimatedHours) {
      newErrors.estimatedHours = 'Estimated hours is required'
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-card pb-4">
          <h2 className="text-xl font-semibold text-foreground">
            {jobCard ? 'Edit Job Card' : 'Add Job Card'}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.description ? 'border-destructive' : 'border-border'
              }`}
              placeholder="Describe the work to be done..."
            />
            {errors.description && (
              <p className="text-xs text-destructive mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {JOB_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleChange}
                step="0.5"
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.estimatedHours ? 'border-destructive' : 'border-border'
                }`}
                placeholder="2.5"
              />
              {errors.estimatedHours && (
                <p className="text-xs text-destructive mt-1">
                  {errors.estimatedHours}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Actual Hours
              </label>
              <input
                type="number"
                name="actualHours"
                value={formData.actualHours}
                onChange={handleChange}
                step="0.5"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Assigned Mechanic
            </label>
            <input
              type="text"
              name="assignedMechanic"
              value={formData.assignedMechanic}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Additional notes..."
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
              {jobCard ? 'Update' : 'Create'} Job Card
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
