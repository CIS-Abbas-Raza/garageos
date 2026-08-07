'use client'

import { Bell, Building2, ChevronDown, Menu, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useGarageStore } from '@/lib/store/garage-store'

interface DashboardHeaderProps {
  title: string
  onNewClick?: () => void
}

export function DashboardHeader({ title, onNewClick }: DashboardHeaderProps) {
  const { companies } = useGarageStore()
  const selectedCompany = companies[0]?.name || 'Select Company'

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex min-h-16 items-center gap-3 px-4 py-3 lg:gap-5 lg:px-6">
        <Button variant="ghost" size="icon" className="size-9 shrink-0" aria-label="Toggle navigation" onClick={() => window.dispatchEvent(new Event('garageos:toggle-sidebar'))}>
          <Menu className="size-5" />
        </Button>
        <div className="hidden items-center gap-2 border-l border-border pl-4 md:flex">
          <Button variant="outline" size="sm" className="h-10 gap-2 rounded-full px-4 font-medium">
            <Building2 className="size-4 text-muted-foreground" />
            <span className="max-w-40 truncate">{selectedCompany}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onNewClick && <Button size="sm" onClick={onNewClick} className="hidden gap-2 rounded-full sm:flex"><Plus className="size-4" />New Job</Button>}
          <Button variant="ghost" size="icon" className="relative size-10" aria-label="Notifications">
            <Bell className="size-[18px]" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
      <div className="flex px-4 pb-3 md:hidden">
        <Button variant="outline" size="sm" className="h-9 gap-2 rounded-full"><Building2 className="size-4" /><span className="max-w-48 truncate">{selectedCompany}</span><ChevronDown className="size-3" /></Button>
      </div>
    </header>
  )
}
