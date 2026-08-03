'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { Button } from '@/components/ui/button'
import { useGarageStore } from '@/lib/store/garage-store'
import { useCRUD } from '@/lib/hooks/use-crud'
import { JobCardDialog } from '@/components/dialogs/job-card-dialog'
import { DeleteConfirmDialog } from '@/components/dialogs/delete-confirm'
import { EmptyState } from '@/components/empty-state'
import { Search, Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function JobCardsPage() {
  const { jobCards } = useGarageStore()
  const { addJobCard, updateJobCard, deleteJobCard } = useCRUD()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingJobCard, setEditingJobCard] = useState<any>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  })

  const filteredJobCards = jobCards.filter((job) => {
    const matchesSearch = job.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddClick = () => {
    setEditingJobCard(null)
    setIsDialogOpen(true)
  }

  const handleEditClick = (jobCard: any) => {
    setEditingJobCard(jobCard)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ open: true, id })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirm.id) {
      deleteJobCard(deleteConfirm.id)
      setDeleteConfirm({ open: false, id: null })
    }
  }

  const handleSaveJobCard = (data: any) => {
    if (editingJobCard) {
      updateJobCard(editingJobCard.id, data)
    } else {
      addJobCard(data)
    }
    setIsDialogOpen(false)
    setEditingJobCard(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-accent/10 text-accent border-accent/20'
      case 'in-progress':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'on-hold':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'in-progress':
        return <Clock className="h-4 w-4" />
      case 'on-hold':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Job Cards</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Create and track all service jobs
                </p>
              </div>
              <Button
                onClick={handleAddClick}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Job Card
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search job cards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Job Cards List */}
            {filteredJobCards.length > 0 ? (
              <div className="space-y-4">
                {filteredJobCards.map((job) => (
                  <div
                    key={job.id}
                    className="border border-border rounded-lg bg-card p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">
                            {job.description}
                          </h3>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
                              job.status
                            )}`}
                          >
                            {getStatusIcon(job.status)}
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </div>
                        </div>
                        {job.assignedMechanic && (
                          <p className="text-sm text-muted-foreground">
                            Assigned to: {job.assignedMechanic}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditClick(job)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 text-primary" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(job.id)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Est. Hours</p>
                        <p className="font-medium text-foreground">
                          {job.estimatedHours}h
                        </p>
                      </div>
                      {job.actualHours && (
                        <div>
                          <p className="text-muted-foreground">Actual Hours</p>
                          <p className="font-medium text-foreground">{job.actualHours}h</p>
                        </div>
                      )}
                      {job.notes && (
                        <div className="sm:col-span-2">
                          <p className="text-muted-foreground">Notes</p>
                          <p className="font-medium text-foreground truncate">
                            {job.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No job cards yet"
                description="Get started by creating your first job card"
                action={{
                  label: 'Create Job Card',
                  onClick: handleAddClick,
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <JobCardDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        jobCard={editingJobCard}
        onSave={handleSaveJobCard}
      />

      <DeleteConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        onConfirm={handleConfirmDelete}
        title="Delete Job Card"
        description="Are you sure you want to delete this job card? This action cannot be undone."
      />
    </div>
  )
}
