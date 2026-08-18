"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { Customer } from "@/lib/types/store"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useGarageStore } from "@/lib/store/garage-store"

const customerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  notes: z.string().optional(),
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer
  mode: "add" | "edit"
  onSubmit: (data: CustomerFormValues & { id?: string, companyId: string }) => void
}

export function CustomerDialog({ open, onOpenChange, customer, mode, onSubmit }: CustomerDialogProps) {
  const { currentCompanyId } = useGarageStore()
  
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      zipCode: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (open && customer && mode === "edit") {
      form.reset({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        zipCode: customer.zipCode,
        notes: customer.notes || "",
      })
    } else if (open && mode === "add") {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        zipCode: "",
        notes: "",
      })
    }
  }, [open, customer, mode, form])

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit({
      ...data,
      id: customer?.id,
      companyId: currentCompanyId,
    })
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] bg-white p-6 rounded-xl border border-slate-200 shadow-xl gap-0">
        <DialogHeader className="space-y-1 mb-6">
          <DialogTitle className="text-xl font-bold text-slate-900">
            {mode === "add" ? "Add Customer" : "Edit Customer"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 font-normal">
            {mode === "add"
              ? "Create a new customer entry."
              : "Make changes to the customer details."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700">First Name *</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                className="h-10 border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors"
                placeholder="Enter first name"
              />
              {form.formState.errors.firstName && (
                <p className="text-xs text-red-500">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700">Last Name *</Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                className="h-10 border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors"
                placeholder="Enter last name"
              />
              {form.formState.errors.lastName && (
                <p className="text-xs text-red-500">{form.formState.errors.lastName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email *</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                className="h-10 border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors"
                placeholder="email@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone *</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                className="h-10 border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors"
                placeholder="Enter phone number"
              />
              {form.formState.errors.phone && (
                <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="address" className="text-sm font-semibold text-slate-700">Address *</Label>
              <Input
                id="address"
                {...form.register("address")}
                className="h-10 border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors"
                placeholder="Enter address"
              />
              {form.formState.errors.address && (
                <p className="text-xs text-red-500">{form.formState.errors.address.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-sm font-semibold text-slate-700">City *</Label>
              <Input
                id="city"
                {...form.register("city")}
                className="h-10 border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors"
                placeholder="City"
              />
              {form.formState.errors.city && (
                <p className="text-xs text-red-500">{form.formState.errors.city.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zipCode" className="text-sm font-semibold text-slate-700">Zip Code *</Label>
              <Input
                id="zipCode"
                {...form.register("zipCode")}
                className="h-10 border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors"
                placeholder="Zip Code"
              />
              {form.formState.errors.zipCode && (
                <p className="text-xs text-red-500">{form.formState.errors.zipCode.message}</p>
              )}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">Notes</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                className="resize-none border-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-colors"
                rows={3}
                placeholder="Enter notes"
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
              {mode === "add" ? "Create Customer" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
