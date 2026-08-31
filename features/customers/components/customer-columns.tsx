"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Customer } from "@/lib/types/store"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, KeyRound, MoreHorizontal, Pencil, Trash } from "lucide-react"

export function createCustomerColumns(
  onView: (customer: Customer) => void,
  onEdit?: (customer: Customer) => void,
  onDelete?: (customer: Customer) => void,
  onResetPassword?: (customer: Customer) => void
): ColumnDef<Customer>[] {
  return [
    {
      id: "name",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: "Customer Name",
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900">{row.original.firstName} {row.original.lastName}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone Number",
    },
    {
      accessorKey: "city",
      header: "Location",
      cell: ({ row }) => (
        <span className="text-gray-500">{row.original.city}, {row.original.zipCode}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const customer = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 hover:bg-slate-100 focus:outline-none">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] bg-white">
              <DropdownMenuLabel className="text-xs font-bold uppercase text-gray-500">Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(customer)} className="text-[13px] cursor-pointer gap-2">
                <Eye className="h-4 w-4" /> View Details
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(customer)} className="text-[13px] cursor-pointer gap-2">
                  <Pencil className="h-4 w-4" /> Edit Customer
                </DropdownMenuItem>
              )}
              {onResetPassword && (
                <DropdownMenuItem onClick={() => onResetPassword(customer)} className="text-[13px] cursor-pointer gap-2">
                  <KeyRound className="h-4 w-4" /> Reset Password
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(customer)} className="text-[13px] cursor-pointer text-red-600 focus:text-red-600 gap-2">
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
