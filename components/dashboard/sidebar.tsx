'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth-context'
import {
  BarChart3,
  Bell,
  Building2,
  Boxes,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Package,
  Search,
  Settings,
  ShieldCheck,
  Truck,
  UserCog,
  UserRoundCog,
  UserRoundCheck,
  Users,
  Wrench,
  Image,
  CalendarCheck,
} from 'lucide-react'

const menuSections = [
  {
    label: 'Administration',
    icon: ShieldCheck,
    items: [
      { href: '/admin', label: 'Admin', icon: ShieldCheck },
      { href: '/users', label: 'Users', icon: Users },
      { href: '/packages', label: 'Package', icon: ClipboardList },
      { href: '/roles', label: 'Roles', icon: ShieldCheck },
    ],
  },
  {
    label: 'Company Management',
    icon: Building2,
    items: [
      { href: '/companies', label: 'Companies', icon: Building2 },
      { href: '/company-users', label: 'Company Employees', icon: Users },
    ],
  },
  {
    label: 'Operations',
    icon: Wrench,
    items: [
      { href: '/customers', label: 'Customers', icon: Users },
      // { href: '/vehicles', label: 'Vehicles', icon: Truck },
      // { href: '/quotations', label: 'Quotation', icon: ClipboardList },
      // { href: '/task-cards', label: 'Task Cards', icon: FileText },
      { href: '/appointments', label: 'Appointments', icon: Calendar },
      { href: '/reviews', label: 'Customer Review', icon: FileText },
    ],
  },
  {
    label: 'Finance & Billing',
    icon: CreditCard,
    items: [
      { href: '/package-subscriptions', label: 'Package Subscriptions', icon: Package },
      // { href: '/invoices', label: 'Invoices', icon: FileText },
      { href: '/invoice-payments', label: 'Invoice Payments', icon: CreditCard },
    ],
  },
  {
    label: 'Other',
    icon: Settings,
    items: [
      { href: '/notifications', label: 'Notifications', icon: Bell },
      { href: '/sms-settings', label: 'SMS Setting', icon: Bell },
      { href: '/whatsapp-settings', label: 'WhatsApp Setting', icon: Bell },
      { href: '/email-settings', label: 'Email Setting (SendGrid)', icon: Bell },
    ],
  },
]

export function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

  const handleSignOut = () => {
    logout()
    toast.success('You have been signed out.')
  }

  const displayEmail = user?.email || 'admin@garageos.com'
  const displayName = user?.userName || 'Garage Admin'
  const initials = displayName.slice(0, 2).toUpperCase()

  // Filter sections by search query
  const filteredSections = menuSections.map((section) => {
    const filteredItems = section.items.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
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
        className={`no-print sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-sidebar transition-all duration-300 max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:w-72 max-md:shadow-2xl ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}`}
      >
        {/* LOGO ROW */}
        <div className="flex items-start justify-between border-b border-sidebar-border px-5 py-5 max-md:px-3">
          <Link href="/dashboard" className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wrench className="size-5" />
            </span>
            <span className={`${collapsed ? 'hidden' : 'flex'} min-w-0 flex-col`}>
              <span className="truncate text-base font-bold text-foreground">GarageOS</span>
              <span className="text-xs text-muted-foreground">v1.0.0</span>
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="size-8 shrink-0 text-muted-foreground hidden md:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={`size-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
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
                  ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary rounded-l-none'
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
                                ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary rounded-l-none'
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

        {/* BOTTOM USER PANEL */}
        <div className="border-t border-sidebar-border p-3 mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className={`flex w-full items-center gap-3 rounded-lg bg-sidebar-accent/40 p-2 text-left outline-none hover:bg-sidebar-accent ${collapsed ? 'justify-center' : ''}`} aria-label="Account menu">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials}</span>
              <span className={`${collapsed ? 'hidden' : 'min-w-0'} flex-1`}><span className="block truncate text-xs font-semibold text-foreground">{displayName}</span><span className="block truncate text-[10px] text-muted-foreground">{displayEmail}</span></span>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-64">
              <div className="flex items-center gap-3 border-b border-border px-2 pb-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials}</span><div className="min-w-0"><p className="truncate text-xs font-semibold">{displayName}</p><p className="truncate text-[10px] text-muted-foreground">{displayEmail}</p></div></div>
              <DropdownMenuItem onClick={() => router.push('/settings/profile')} className="mt-2 cursor-pointer gap-2"><UserRoundCheck className="size-4 text-primary" /> Profile Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/my-notifications')} className="cursor-pointer gap-2"><Bell className="size-4 text-primary" /> Notifications</DropdownMenuItem>
              <div className="my-2 border-t border-border" />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 text-destructive"><LogOut className="size-4" /> Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  )
}
