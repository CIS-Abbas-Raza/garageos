"use client"

import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  message?: string
  onConfirm: () => void | Promise<void>
  successMessage?: string
  errorMessage?: string
}

export function ConfirmDeleteModal({
  open,
  onOpenChange,
  title = "Delete record?",
  message = "This action cannot be undone.",
  onConfirm,
  successMessage = "Record deleted successfully.",
  errorMessage = "Unable to delete record.",
}: ConfirmDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      toast.success(successMessage)
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              void handleConfirm()
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}