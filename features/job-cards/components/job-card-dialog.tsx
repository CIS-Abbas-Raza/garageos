"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { JobCard } from "@/lib/types/store"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGarageStore } from "@/lib/store/garage-store"

const jobCardSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["pending", "in-progress", "completed", "on-hold"]),
  priority: z.enum(["low", "medium", "high"]),
  total: z.number().min(0, "Total must be positive"),
})

type JobCardFormValues = z.infer<typeof jobCardSchema>

interface JobCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobCard?: JobCard
  mode: "add" | "edit"
  onSubmit: (data: JobCardFormValues & { id?: string, companyId: string, vehicleId: string, customerId: string, mechanicId: string }) => void
}

export function JobCardDialog({ open, onOpenChange, jobCard, mode, onSubmit }: JobCardDialogProps) {
  const { currentCompanyId } = useGarageStore()
  
  const form = useForm<JobCardFormValues>({
    resolver: zodResolver(jobCardSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      total: 0,
    },
  })

  useEffect(() => {
    if (open && jobCard && mode === "edit") {
      form.reset({
        title: jobCard.title,
        description: jobCard.description,
        status: jobCard.status,
        priority: jobCard.priority,
        total: jobCard.total,
      })
    } else if (open && mode === "add") {
      form.reset({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        total: 0,
      })
    }
  }, [open, jobCard, mode, form])

  const handleSubmit = form.handleSubmit((data) => {
    // In a real app we'd pick vehicleId, customerId, mechanicId from dropdowns. Mocking for now.
    onSubmit({
      ...data,
      id: jobCard?.id,
      companyId: currentCompanyId,
      vehicleId: jobCard?.vehicleId || "veh-mock",
      customerId: jobCard?.customerId || "cust-mock",
      mechanicId: jobCard?.mechanicId || "mech-mock",
    })
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-white">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Create Job Card" : "Edit Job Card"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Enter the details of the new job card." : "Make changes to the job card details."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input id="title" {...form.register("title")} />
              {form.formState.errors.title && <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select onValueChange={(val: any) => form.setValue("status", val)} defaultValue={form.getValues("status")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select onValueChange={(val: any) => form.setValue("priority", val)} defaultValue={form.getValues("priority")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" {...form.register("description")} className="resize-none" rows={4} />
              {form.formState.errors.description && <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="total">Estimated Total ($) *</Label>
              <Input id="total" type="number" step="0.01" {...form.register("total", { valueAsNumber: true })} />
              {form.formState.errors.total && <p className="text-xs text-red-500">{form.formState.errors.total.message}</p>}
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {mode === "add" ? "Create Job Card" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
