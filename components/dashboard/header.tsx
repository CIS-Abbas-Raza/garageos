'use client'

import { useState } from 'react'
import { Bell, Building2, ChevronDown, MapPin, Menu, Plus, Search } from 'lucide-react'
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
  const [query, setQuery] = useState('')

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
          <Button variant="outline" size="sm" className="h-10 gap-2 rounded-full px-4 font-medium">
            <MapPin className="size-4 text-muted-foreground" />
            <span>Main Branch</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        </div>
        <div className="relative min-w-0 flex-1 md:mx-auto md:max-w-2xl">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input aria-label="Global search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customers, vehicles, jobs..." className="h-10 w-full rounded-full border border-border bg-muted/30 pl-11 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20" />
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
      <div className="flex gap-2 px-4 pb-3 md:hidden">
        <Button variant="outline" size="sm" className="h-9 flex-1 gap-2 rounded-full"><Building2 className="size-4" /><span className="truncate">{selectedCompany}</span><ChevronDown className="size-3" /></Button>
        <Button variant="outline" size="sm" className="h-9 flex-1 gap-2 rounded-full"><MapPin className="size-4" /><span>Main Branch</span><ChevronDown className="size-3" /></Button>
      </div>
    </header>
  )
}
