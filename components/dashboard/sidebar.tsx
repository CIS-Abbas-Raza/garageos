'use client'

import Link from 'next/link'
import NextImage from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth-context'
import { useBranch } from '@/lib/branch-context'
import { canAccessDashboardPath, getDashboardRole } from '@/lib/role-access'
import { useRolePermissions } from '@/lib/hooks/use-role-permissions'
import {
  BarChart3,
  Bell,
  Building2,
  Boxes,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Package,
  Search,
  ShieldCheck,
  Truck,
  UserCog,
  UserRoundCog,
  UserRoundCheck,
  Users,
  Wrench,
  CalendarCheck,
  X,
} from 'lucide-react'

const menuSections = [
  {
    label: 'Administration',
    icon: ShieldCheck,
    superAdminOnly: true,
    items: [
      { href: '/admin', label: 'Admin', icon: ShieldCheck },
      { href: '/users', label: 'Users', icon: Users },
      { href: '/packages', label: 'Package', icon: ClipboardList },
      { href: '/modules', label: 'Modules', icon: Boxes },
      { href: '/companies', label: 'Companies', icon: Building2 },
      { href: '/package-subscriptions', label: 'Package Subscriptions', icon: Package },
      { href: '/company-sales', label: 'Company Sales', icon: BarChart3 },
      { href: '/demo-bookings', label: 'Demo Booking', icon: CalendarCheck },
      { href: '/sms-settings', label: 'SMS Setting', icon: Bell },
      { href: '/whatsapp-settings', label: 'WhatsApp Setting', icon: Bell },
      { href: '/email-settings', label: 'Email Setting', icon: Bell },
    ],
  },
  {
    label: 'Company Management',
    icon: Building2,
    items: [
      { href: '/company-users', label: 'Company Employees', icon: Users },
      { href: '/roles', label: 'Role Management', icon: ShieldCheck },
      { href: '/communication-logs', label: 'Communication Logs', icon: FileText },
    ],
  },
  {
    label: 'Operations',
    icon: Wrench,
    items: [
      { href: '/customers', label: 'Customers', icon: Users },
      { href: '/all-vehicle', label: 'All Vehicles', icon: Truck },
      // { href: '/quotations', label: 'Quotation', icon: ClipboardList },
      // { href: '/task-cards', label: 'Task Cards', icon: FileText },
      { href: '/assigned-tasks', label: 'Assigned Tasks', icon: ClipboardList },
      { href: '/appointments', label: 'Appointments', icon: Calendar },
      { href: '/reviews', label: 'Customer Review', icon: FileText },
    ],
  },
  {
    label: 'Finance & Billing',
    icon: CreditCard,
    items: [
      { href: '/all-invoices', label: 'All Invoices', icon: FileText },
      { href: '/invoice-payments', label: 'Invoice Payments', icon: CreditCard },
      { href: '/sales', label: 'Sales', icon: BarChart3 },
      { href: '/company-accounts', label: 'Company Account', icon: CreditCard },
      { href: '/account-ledger', label: 'Account Ledger', icon: FileText },
    ],
  },
]

export function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isSuperAdmin } = useAuth()
  const { canSubModule } = useRolePermissions()
  const { selectedCompany } = useBranch()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCompanyName, setSelectedCompanyName] = useState('')
  const [hoverMenu, setHoverMenu] = useState<{ label: string; top: number; left: number } | null>(null)
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const closeHoverMenuSoon = () => {
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current)
    hoverCloseTimer.current = setTimeout(() => setHoverMenu(null), 180)
  }

  const keepHoverMenuOpen = () => {
    if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current)
  }

  // Determine active states to auto-expand parent sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const activeState: Record<string, boolean> = { Main: true }
    menuSections.forEach((section) => {
      if (section.items.some((item) => pathname === item.href)) {
        activeState[section.label] = true
      }
    })
    return activeState
  })

  useEffect(() => {
    const toggleSidebar = () => {
      if (window.matchMedia('(max-width: 767px)').matches) setMobileOpen((current) => !current)
      else setCollapsed((current) => !current)
    }
    window.addEventListener('garageos:toggle-sidebar', toggleSidebar)
    return () => window.removeEventListener('garageos:toggle-sidebar', toggleSidebar)
  }, [])

  useEffect(() => {
    if (isSuperAdmin || !selectedCompany) {
      setSelectedCompanyName('')
      return
    }

    let cancelled = false
    const loadSelectedCompany = async () => {
      try {
        const response = await fetch(`/backend-api/companies/${encodeURIComponent(selectedCompany)}`)
        const result = await response.json()
        if (!response.ok || result.success === false || !result.data) {
          throw new Error(result.message || 'Unable to load company.')
        }
        if (!cancelled) {
          setSelectedCompanyName(String(result.data.name ?? result.data.company_name ?? 'Selected Company'))
        }
      } catch {
        if (!cancelled) setSelectedCompanyName('Selected Company')
      }
    }

    void loadSelectedCompany()
    return () => { cancelled = true }
  }, [isSuperAdmin, selectedCompany])

  const handleSignOut = () => {
    logout()
    toast.success('You have been signed out.')
  }

  const displayEmail = user?.email || 'admin@garageos.com'
  const displayName = user?.userName || 'Garage Admin'
  const profilePicture = user?.profilePhoto || null
  const displayRole = isSuperAdmin ? 'Super Admin' : user?.roleName?.trim()
  const isOwner = !isSuperAdmin && user?.roleName?.trim().toLowerCase() === 'owner'
  const initials = displayName.slice(0, 2).toUpperCase()

  const role = getDashboardRole(user)
  const sidebarLabel = isSuperAdmin ? 'Super Admin' : selectedCompanyName || 'Selected Company'

  // Filter sections by the active role, then by search query.
  const filteredSections = menuSections.filter((section) => !section.superAdminOnly || isSuperAdmin).map((section) => {
    const filteredItems = section.items.filter((item) =>
      canAccessDashboardPath(role, item.href)
      && canSubModule(item.label, 'view')
      && item.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return { ...section, items: filteredItems }
  }).filter((section) => section.items.length > 0)

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`no-print sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:w-72 max-md:shadow-2xl ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}`}
      >
        {/* LOGO ROW */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-5 max-md:px-3">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center">
              <NextImage
                src="/garageworkos-logo.png"
                alt="GarageWorkOs"
                width={96}
                height={48}
                priority
                className="h-12 w-12 object-contain"
              />
            </span>
            <span className={`${collapsed ? 'hidden' : 'flex'} min-w-0 flex-col`}>
              <span className="truncate text-base font-bold text-foreground">GarageWorkOs</span>
              <span className="truncate text-xs text-muted-foreground">{sidebarLabel}</span>
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="size-8 shrink-0 text-muted-foreground md:hidden"
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* SEARCH BOX */}
        <div className={`${collapsed ? 'hidden' : 'block'} border-b border-sidebar-border px-4 py-3`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              aria-label="Search modules"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-sidebar-border bg-background px-3 pl-9 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>

        {/* NAV ITEMS */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-1">
            {/* Home link */}
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-gray-800 font-semibold hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <Home className="size-4 shrink-0" />
              <span className={collapsed ? 'hidden' : 'inline'}>Home</span>
            </Link>

            {filteredSections.map((section) => {
              const isExpanded = expandedSections[section.label] ?? false
              return (
                <div key={section.label} className="mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSections((current) => ({
                        ...current,
                        [section.label]: !isExpanded,
                      }))
                    }
                    onMouseEnter={(event) => {
                      if (!collapsed) return
                      keepHoverMenuOpen()
                      const bounds = event.currentTarget.getBoundingClientRect()
                      setHoverMenu({ label: section.label, top: bounds.top, left: bounds.right })
                    }}
                    onMouseLeave={() => {
                      if (collapsed) closeHoverMenuSoon()
                    }}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors ${
                      collapsed ? 'justify-center' : 'justify-between'
                    }`}
                    aria-expanded={isExpanded}
                  >
                    <span className="flex items-center gap-3">
                      <section.icon className="size-4 shrink-0 text-muted-foreground" />
                      <span className={collapsed ? 'hidden' : 'inline'}>{section.label}</span>
                    </span>
                    {!collapsed && (
                      <ChevronRight
                        className={`size-3 text-muted-foreground transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    )}
                  </button>
                  {isExpanded && !collapsed && (
                    <div className="mt-1 flex flex-col gap-0.5 border-l border-sidebar-border ml-5 pl-2">
                      {section.items.map((item) => {
                        const Icon = item.icon
                        const isActive =
                          pathname === item.href || pathname.startsWith(`${item.href}/`)
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                              isActive
                                ? 'bg-primary/10 text-primary font-bold'
                                : 'text-gray-700 font-medium hover:text-gray-900 hover:bg-sidebar-accent/50'
                            }`}
                          >
                            <span className={isActive ? 'text-primary' : 'text-gray-700 font-medium'}>
                              {item.label}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </nav>

        {collapsed && hoverMenu && (() => {
          const section = filteredSections.find((item) => item.label === hoverMenu.label)
          if (!section) return null
          return (
            <div
              className="fixed z-[100] w-60 rounded-lg border border-border bg-sidebar p-2 shadow-xl"
              style={{ top: hoverMenu.top, left: hoverMenu.left }}
              onMouseEnter={keepHoverMenuOpen}
              onMouseLeave={() => setHoverMenu(null)}
            >
              <p className="px-3 py-2 text-xs font-semibold text-muted-foreground">{section.label}</p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        setHoverMenu(null)
                        setMobileOpen(false)
                      }}
                      className={`rounded-md px-3 py-2 text-[13px] transition-colors ${
                        isActive
                          ? 'bg-primary/10 font-bold text-primary'
                          : 'text-gray-700 hover:bg-sidebar-accent/50 hover:text-gray-900'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* BOTTOM USER PANEL */}
        <div className="border-t border-sidebar-border p-3 mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className={`flex w-full items-center gap-3 rounded-lg bg-sidebar-accent/40 p-2 text-left outline-none hover:bg-sidebar-accent ${collapsed ? 'justify-center' : ''}`} aria-label="Account menu">
              <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">{profilePicture ? <img src={profilePicture} alt={`${displayName} profile`} className="size-full object-cover" /> : initials}</span>
              <span className={`${collapsed ? 'hidden' : 'min-w-0'} flex-1`}><span className="block truncate text-xs font-semibold text-foreground">{displayName}</span><span className="block truncate text-[10px] text-muted-foreground">{displayEmail}</span>{displayRole && <span className="block truncate text-[10px] text-muted-foreground">{displayRole}</span>}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-64">
              <div className="flex items-center gap-3 border-b border-border px-2 pb-3"><span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">{profilePicture ? <img src={profilePicture} alt={`${displayName} profile`} className="size-full object-cover" /> : initials}</span><div className="min-w-0"><p className="truncate text-xs font-semibold">{displayName}</p><p className="truncate text-[10px] text-muted-foreground">{displayEmail}</p>{displayRole && <p className="truncate text-[10px] text-muted-foreground">{displayRole}</p>}</div></div>
              {isOwner && <DropdownMenuItem onClick={() => router.push('/package-subscriptions-history')} className="mt-2 cursor-pointer gap-2"><Package className="size-4 text-primary" /> Company Settings</DropdownMenuItem>}
              <DropdownMenuItem onClick={() => router.push('/settings/profile')} className="mt-2 cursor-pointer gap-2"><UserRoundCheck className="size-4 text-primary" /> Profile Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/notifications')} className="cursor-pointer gap-2"><Bell className="size-4 text-primary" /> Notifications</DropdownMenuItem>
              <div className="my-2 border-t border-border" />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 text-destructive"><LogOut className="size-4" /> Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  )
}
