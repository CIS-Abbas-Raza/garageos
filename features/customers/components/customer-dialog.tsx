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
      <DialogContent className="sm:max-w-[550px] bg-white">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Customer" : "Edit Customer"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Enter the details of the new customer." : "Make changes to the customer details."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" {...form.register("firstName")} />
              {form.formState.errors.firstName && <p className="text-xs text-red-500">{form.formState.errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" {...form.register("lastName")} />
              {form.formState.errors.lastName && <p className="text-xs text-red-500">{form.formState.errors.lastName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" {...form.register("phone")} />
              {form.formState.errors.phone && <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>}
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input id="address" {...form.register("address")} />
              {form.formState.errors.address && <p className="text-xs text-red-500">{form.formState.errors.address.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" {...form.register("city")} />
              {form.formState.errors.city && <p className="text-xs text-red-500">{form.formState.errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code *</Label>
              <Input id="zipCode" {...form.register("zipCode")} />
              {form.formState.errors.zipCode && <p className="text-xs text-red-500">{form.formState.errors.zipCode.message}</p>}
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...form.register("notes")} className="resize-none" rows={3} />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {mode === "add" ? "Create Customer" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
