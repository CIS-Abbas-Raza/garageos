'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon ? (
        <div className="text-4xl mb-4">{icon}</div>
      ) : (
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold mt-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm text-center">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          <Plus className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  )
}
