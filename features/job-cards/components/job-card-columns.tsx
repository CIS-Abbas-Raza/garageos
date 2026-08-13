"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { JobCard } from "@/lib/types/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { format } from "date-fns"

export function createJobCardColumns(
  onView: (jobCard: JobCard) => void,
  onEdit?: (jobCard: JobCard) => void,
  onDelete?: (jobCard: JobCard) => void
): ColumnDef<JobCard>[] {
  return [
    {
      accessorKey: "title",
      header: "Job Title",
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        const colors = {
          pending: "bg-yellow-100 text-yellow-800",
          "in-progress": "bg-blue-100 text-blue-800",
          completed: "bg-green-100 text-green-800",
          "on-hold": "bg-gray-100 text-gray-800",
        }
        return (
          <Badge variant="outline" className={`font-medium ${colors[status]} border-0 capitalize`}>
            {status.replace("-", " ")}
          </Badge>
        )
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.original.priority
        const colors = {
          low: "text-gray-500",
          medium: "text-orange-500",
          high: "text-red-600 font-bold",
        }
        return (
          <span className={`capitalize ${colors[priority]}`}>
            {priority}
          </span>
        )
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => <span className="font-medium">${row.original.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }) => <span className="text-gray-500">{format(new Date(row.original.createdAt), 'MMM d, yyyy')}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const jobCard = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] bg-white">
              <DropdownMenuLabel className="text-xs font-bold uppercase text-gray-500">Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(jobCard)} className="text-[13px] cursor-pointer gap-2">
                <Eye className="h-4 w-4" /> View Details
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(jobCard)} className="text-[13px] cursor-pointer gap-2">
                  <Pencil className="h-4 w-4" /> Edit Job Card
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(jobCard)} className="text-[13px] cursor-pointer text-red-600 focus:text-red-600 gap-2">
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
