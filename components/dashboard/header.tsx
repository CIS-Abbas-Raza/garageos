'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, Building2, ChevronDown, Menu, LogOut, MapPin, UserRound, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useBranch } from '@/lib/branch-context'
import { useAuth } from '@/lib/auth-context'
import { useGarageStore } from '@/lib/store/garage-store'
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

interface CompanyOption {
  id: string
  name: string
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const { selectedCompany, selectedBranch, setSelectedCompany, setSelectedBranch } = useBranch()
  const { user, logout, isSuperAdmin } = useAuth()
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useGarageStore()

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await fetch('/backend-api/companies')
        const body = await response.json()
        const records = Array.isArray(body?.data) ? body.data : []

        if (!response.ok || body?.success === false) {
          throw new Error(body?.message || 'Unable to load companies.')
        }

        setCompanies(records.map((company: Record<string, unknown>) => ({
          id: String(company.id),
          name: String(company.name ?? company.company_name ?? company.email ?? `Company ${company.id}`),
        })))
      } catch (error) {
        setCompanies([])
        toast.error(error instanceof Error ? error.message : 'Unable to load companies.')
      }
    }

    void loadCompanies()
  }, [])

  const handleSignOut = () => {
    logout()
    toast.success('You have been signed out.')
  }

  const currentCompany = companies.find(c => c.id === selectedCompany)
  const currentCompanyName = currentCompany?.name || 'Select Company'

  const branches = [
    { id: 'b1', name: 'Jinnah Branch' },
    { id: 'b2', name: 'Iqbal Branch' },
  ]
  const currentBranchName = branches.find(b => b.id === selectedBranch)?.name || branches[0].name
  const companyId = selectedCompany ?? user?.roles.find((role) => role.scopeId)?.scopeId
  const relevantNotifications = notifications
    .filter((notification) => notification.status !== 0 && (!notification.recipientType || notification.recipientType === 'all' || (notification.recipientType === 'company' && notification.recipientId === companyId) || (notification.recipientType === 'user' && notification.recipientId === user?.id)))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const unreadCount = relevantNotifications.filter((notification) => !notification.read && !notification.reads?.some((read) => read.userId === user?.id && read.isRead)).length

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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
              aria-label={isSuperAdmin ? 'Select the active company for the dashboard' : 'Current company'}
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
                  {company.name}{selectedCompany === company.id ? ' (Selected)' : ''}
                </DropdownMenuItem>
              ))}
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
          <DropdownMenu>
            <DropdownMenuTrigger className="relative inline-flex size-9 items-center justify-center rounded-lg text-foreground outline-none hover:bg-muted/60" aria-label="Notifications">
              <Bell className="size-[18px]" />
              {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-destructive-foreground ring-2 ring-background">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3"><div><p className="text-sm font-semibold">Notifications</p><p className="text-xs text-muted-foreground">{unreadCount} unread</p></div><button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline" onClick={() => markAllNotificationsAsRead(user?.id)}><CheckCheck className="size-3.5" /> Mark all</button></div>
              <div className="max-h-80 overflow-y-auto">{relevantNotifications.slice(0, 5).map((notification) => { const read = notification.read || notification.reads?.some((item) => item.userId === user?.id && item.isRead); return <button type="button" key={notification.id} onClick={() => markNotificationAsRead(notification.id, user?.id)} className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left hover:bg-muted/40"><span className={`mt-1 size-2 shrink-0 rounded-full ${read ? 'bg-muted' : 'bg-primary'}`} /><span className="min-w-0 flex-1"><span className={`block truncate text-xs ${read ? 'font-medium' : 'font-bold'}`}>{notification.title}</span><span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">{notification.message}</span><span className="mt-1 block text-[10px] text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</span></span></button> })}{relevantNotifications.length === 0 && <p className="px-4 py-8 text-center text-xs text-muted-foreground">You are all caught up.</p>}</div>
              <div className="p-2"><Link href="/my-notifications" className="block rounded-md px-3 py-2 text-center text-xs font-semibold text-primary hover:bg-primary/10">View All</Link></div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dark / light toggle */}
          <ThemeToggle />

          {/* Logout */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground" aria-label="User menu"><UserRound className="size-[18px]" /></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => { window.location.href = '/settings/profile' }} className="cursor-pointer gap-2"><UserRound className="size-4" /> Profile Settings</DropdownMenuItem><DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 text-destructive"><LogOut className="size-4" /> Sign out</DropdownMenuItem></DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  )
}
