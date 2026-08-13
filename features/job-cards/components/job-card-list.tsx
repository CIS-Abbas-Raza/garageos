"use client"

import { useState } from "react"
import { FileText, Plus } from "lucide-react"
import { toast } from "sonner"
import type { JobCard } from "@/lib/types/store"
import { useGarageStore } from "@/lib/store/garage-store"
import { useModulePermissions } from "@/lib/hooks/use-module-permissions"
import { MODULE_RESOURCE } from "../permissions"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { createJobCardColumns } from "./job-card-columns"
import { JobCardDialog } from "./job-card-dialog"

export function JobCardList() {
  const { canCreate, canUpdate, canDelete } = useModulePermissions(MODULE_RESOURCE)
  const { jobCards, addJobCard, updateJobCard, deleteJobCard } = useGarageStore()
  
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleView = (jobCard: JobCard) => {
    setSelectedJobCard(jobCard)
    setIsEditOpen(true)
  }

  const handleEdit = (jobCard: JobCard) => {
    setSelectedJobCard(jobCard)
    setIsEditOpen(true)
  }

  const handleDelete = (jobCard: JobCard) => {
    if (confirm(`Are you sure you want to delete this job card?`)) {
      deleteJobCard(jobCard.id)
      toast.success("Job card deleted successfully.")
    }
  }

  const handleAddSubmit = (data: any) => {
    addJobCard(data)
    toast.success("Job card created successfully.")
  }

  const handleUpdateSubmit = (data: any) => {
    if (data.id) {
      updateJobCard(data.id, data)
      toast.success("Job card updated successfully.")
    }
  }

  const columns = createJobCardColumns(
    handleView, 
    canUpdate ? handleEdit : undefined, 
    canDelete ? handleDelete : undefined
  )

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start justify-between shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 md:h-7 md:w-7 text-primary" />
            <h1 className="text-[20px] md:text-[28px] font-bold text-gray-900 tracking-tight">Job Cards</h1>
          </div>
          <p className="text-[13px] md:text-[14px] text-gray-400 font-medium">Manage and track active repairs and services</p>
        </div>
        {canCreate && (
          <Button
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg gap-2 shadow-sm h-auto font-bold text-[14px] w-full md:w-auto justify-center"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="h-4.5 w-4.5" />
            Create Job Card
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={jobCards}
        searchKey="title"
        searchPlaceholder="Search job cards by title..."
        enableViewToggle={false}
        totalCounts={{
          total: jobCards.length,
          active: jobCards.filter(j => j.status === 'in-progress' || j.status === 'pending').length,
        }}
      />

      {canCreate && (
        <JobCardDialog 
          open={isAddOpen} 
          onOpenChange={setIsAddOpen} 
          mode="add" 
          onSubmit={handleAddSubmit} 
        />
      )}

      {canUpdate && (
        <JobCardDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          jobCard={selectedJobCard || undefined}
          mode="edit"
          onSubmit={handleUpdateSubmit}
        />
      )}
    </div>
  )
}
