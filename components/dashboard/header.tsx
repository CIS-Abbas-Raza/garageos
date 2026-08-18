'use client'

import { Bell, Building2, ChevronDown, Menu, LogOut, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useGarageStore } from '@/lib/store/garage-store'
import { useBranch } from '@/lib/branch-context'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DashboardHeaderProps {
  title: string
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const { companies } = useGarageStore()
  const { selectedCompany, selectedBranch, setSelectedCompany, setSelectedBranch } = useBranch()
  const { logout } = useAuth()

  const handleSignOut = () => {
    logout()
    toast.success('You have been signed out.')
  }

  const currentCompany = companies.find(c => c.id === selectedCompany)
  const currentCompanyName = currentCompany?.name || companies[0]?.name || 'Select Company'

  const branches = [
    { id: 'b1', name: 'Jinnah Branch' },
    { id: 'b2', name: 'Iqbal Branch' },
  ]
  const currentBranchName = branches.find(b => b.id === selectedBranch)?.name || branches[0].name

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center px-4 lg:px-6">

        {/* ── FAR LEFT: Hamburger toggle ── */}
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 text-foreground"
          aria-label="Toggle navigation"
          onClick={() => window.dispatchEvent(new Event('garageos:toggle-sidebar'))}
        >
          <Menu className="size-5" />
        </Button>

        {/* Thin vertical divider */}
        <div className="mx-2 h-6 w-px bg-border shrink-0" />

        {/* ── LEFT: Company + Branch selector pills ── */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Company selector */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground outline-none hover:bg-muted/60 transition-colors focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <Building2 className="size-3.5 text-muted-foreground shrink-0" />
              <span className="max-w-[130px] truncate">{currentCompanyName}</span>
              <ChevronDown className="size-3 text-muted-foreground shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {companies.map((company) => (
                <DropdownMenuItem
                  key={company.id}
                  onClick={() => setSelectedCompany(company.id)}
                  className="text-xs cursor-pointer"
                >
                  {company.name}
                </DropdownMenuItem>
              ))}
              {companies.length === 0 && (
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  No companies configured
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Branch selector */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground outline-none hover:bg-muted/60 transition-colors focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <MapPin className="size-3.5 text-muted-foreground shrink-0" />
              <span className="max-w-[130px] truncate">{currentBranchName}</span>
              <ChevronDown className="size-3 text-muted-foreground shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {branches.map((branch) => (
                <DropdownMenuItem
                  key={branch.id}
                  onClick={() => setSelectedBranch(branch.id)}
                  className="text-xs cursor-pointer"
                >
                  {branch.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu> */}

        </div>

        {/* ── FAR RIGHT: Notification · Theme · Logout ── */}
        <div className="ml-auto flex items-center gap-0.5 shrink-0">

          {/* Notification bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative size-9 text-foreground hover:bg-muted/60"
            aria-label="Notifications"
          >
            <Bell className="size-[18px]" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
          </Button>

          {/* Dark / light toggle */}
          <ThemeToggle />

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="size-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label="Sign out"
          >
            <LogOut className="size-[18px]" />
          </Button>

        </div>
      </div>
    </header>
  )
}
