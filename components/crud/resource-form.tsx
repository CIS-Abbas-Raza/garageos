'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'

interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'tel'
  required?: boolean
  options?: { label: string; value: string }[]
  placeholder?: string
  value?: string | number | boolean
}

interface ResourceFormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => void
  onCancel: () => void
  title: string
  isSubmitting?: boolean
}

export function ResourceForm({
  fields,
  onSubmit,
  onCancel,
  title,
  isSubmitting = false,
}: ResourceFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(
    fields.reduce((acc, field) => {
      acc[field.name] = field.value || ''
      return acc
    }, {})
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (
    name: string,
    value: any,
    type: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? !prev[name] : value,
    }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    const newErrors: Record<string, string> = {}
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                {field.type !== 'checkbox' && (
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-destructive"> *</span>}
                  </Label>
                )}

                {field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'date' || field.type === 'number' ? (
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={(e) =>
                      handleChange(field.name, e.target.value, field.type)
                    }
                    className={errors[field.name] ? 'border-destructive' : ''}
                  />
                ) : field.type === 'textarea' ? (
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={(e) =>
                      handleChange(field.name, e.target.value, field.type)
                    }
                    className={errors[field.name] ? 'border-destructive' : ''}
                    rows={4}
                  />
                ) : field.type === 'select' ? (
                  <Select
                    value={formData[field.name]}
                    onValueChange={(value) =>
                      handleChange(field.name, value, field.type)
                    }
                  >
                    <SelectTrigger
                      className={errors[field.name] ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={field.name}
                      checked={formData[field.name]}
                      onCheckedChange={(checked) =>
                        handleChange(field.name, checked, field.type)
                      }
                    />
                    <Label htmlFor={field.name} className="cursor-pointer">
                      {field.label}
                    </Label>
                  </div>
                ) : null}

                {errors[field.name] && (
                  <p className="text-sm text-destructive">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
