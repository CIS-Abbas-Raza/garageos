'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/auth-store'
import {
  AlertCircle,
  BarChart3,
  Bell,
  Building2,
  Boxes,
  Calendar,
  ChevronDown,
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
  Users,
  Wrench,
  Image,
  CalendarCheck,
} from 'lucide-react'

const menuSections = [
  { label: 'Main', icon: Home, items: [{ href: '/dashboard', label: 'Dashboard', icon: Home }] },
  {
    label: 'Administration',
    icon: ShieldCheck,
    items: [
      { href: '/admin', label: 'Admin', icon: ShieldCheck },
      { href: '/companies', label: 'Companies', icon: Building2 },
      { href: '/users', label: 'Users', icon: Users },
      { href: '/company-users', label: 'Company Users', icon: UserCog },
      { href: '/roles', label: 'Roles', icon: ShieldCheck },
      { href: '/role-assignments', label: 'Role Assignments', icon: UserCog },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
  {
    label: 'Company Management',
    icon: Building2,
    items: [
      { href: '/customers', label: 'Customers', icon: Users },
      { href: '/mechanics', label: 'Mechanics', icon: UserRoundCog },
      { href: '/packages', label: 'Packages', icon: ClipboardList },
      { href: '/appointments', label: 'Appointments', icon: Calendar },
    ],
  },
  {
    label: 'Operations',
    icon: Wrench,
    items: [
      { href: '/vehicles', label: 'Vehicles', icon: Truck },
      { href: '/vehicle-inspections', label: 'Vehicle Inspections', icon: ClipboardList },
      { href: '/vehicle-maintenance-pictures', label: 'Maintenance Pictures', icon: Image },
      { href: '/demo-bookings', label: 'Demo Bookings', icon: CalendarCheck },
      { href: '/job-cards', label: 'Job Cards', icon: FileText },
      { href: '/quotations', label: 'Quotations', icon: ClipboardList },
      { href: '/inventory', label: 'Inventory', icon: Package },
    ],
  },
  {
    label: 'Finance & Billing',
    icon: CreditCard,
    items: [
      { href: '/invoices', label: 'Invoices', icon: FileText },
      { href: '/invoice-payments', label: 'Invoice Payments', icon: CreditCard },
      { href: '/expenses', label: 'Expenses', icon: CreditCard },
      { href: '/sales-report', label: 'Sales Report', icon: BarChart3 },
    ],
  },
  {
    label: 'Supply Chain',
    icon: Truck,
    items: [
      { href: '/parts', label: 'Parts', icon: Boxes },
      { href: '/suppliers', label: 'Suppliers', icon: Truck },
      { href: '/purchase-orders', label: 'Purchase Orders', icon: ClipboardList },
    ],
  },
  {
    label: 'Other',
    icon: Boxes,
    items: [
      { href: '/reports', label: 'Reports', icon: BarChart3 },
      { href: '/reviews', label: 'Reviews', icon: FileText },
      { href: '/communication-settings', label: 'Communications', icon: Bell },
      { href: '/sms-settings', label: 'SMS Settings', icon: Bell },
      { href: '/whatsapp-settings', label: 'WhatsApp Settings', icon: Bell },
      { href: '/email-settings', label: 'Email Settings', icon: Bell },
      { href: '/profile', label: 'Profile', icon: UserRoundCog },
    ],
  },
]

export function DashboardSidebar() {
  const router = useRouter()
  const { email, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ Main: true })

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
    router.push('/login')
  }

  return (
    <>
      {mobileOpen && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-sidebar transition-all duration-300 max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:w-72 max-md:shadow-2xl ${collapsed ? 'w-20' : 'w-72'} ${mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}`}>
      <div className="flex items-start justify-between border-b border-sidebar-border px-5 py-5 max-md:px-3">
        <Link href="/dashboard" className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary/10 text-sidebar-primary">
            <Wrench className="size-5" />
          </span>
          <span className={`${collapsed ? 'hidden' : 'flex'} min-w-0 flex-col max-md:hidden`}>
            <span className="truncate text-base font-bold text-sidebar-foreground">GarageOS</span>
            <span className="text-xs text-muted-foreground">v1.0.0</span>
          </span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="size-8 shrink-0 text-muted-foreground" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <ChevronLeft className={`size-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      <div className={`${collapsed ? 'hidden' : 'block'} border-b border-sidebar-border px-4 py-4 max-md:hidden`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input aria-label="Search modules" placeholder="Search modules..." className="h-10 w-full rounded-lg border border-sidebar-border bg-background/40 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-sidebar-primary/20" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="flex flex-col gap-4">
          {menuSections.map((section) => {
            const isExpanded = expandedSections[section.label] ?? false
            return (
              <div key={section.label}>
                <button type="button" onClick={() => setExpandedSections((current) => ({ ...current, [section.label]: !isExpanded }))} className={`${collapsed ? 'justify-center' : 'justify-between'} flex w-full items-center rounded-md px-2 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground`} aria-expanded={isExpanded}>
                  <span className="flex items-center gap-2">
                    <section.icon className="size-4 shrink-0" />
                    <span className={collapsed ? 'sr-only' : 'max-md:hidden'}>{section.label}</span>
                  </span>
                  {!collapsed && <ChevronDown className={`size-3 transition-transform max-md:hidden ${isExpanded ? '' : '-rotate-90'}`} />}
                </button>
                {isExpanded && (
                  <div className="mt-1 flex flex-col gap-1">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} title={collapsed ? item.label : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${collapsed ? 'justify-center px-2' : 'max-md:justify-center max-md:px-2'} ${item.href === '/dashboard' ? 'bg-sidebar-accent font-medium' : ''}`}>
                          <Icon className="size-[18px] shrink-0" />
                          <span className={`${collapsed ? 'hidden' : 'inline'} max-md:hidden`}>{item.label}</span>
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

      <div className="border-t border-sidebar-border p-3">
        <Link href="/settings" className={`mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent ${collapsed ? 'justify-center px-2' : 'max-md:justify-center max-md:px-2'}`} title="Settings">
          <Settings className="size-[18px] shrink-0" />
          <span className={`${collapsed ? 'hidden' : 'inline'} max-md:hidden`}>Settings</span>
        </Link>
        <div className={`flex items-center gap-3 rounded-lg bg-sidebar-accent/60 p-2 ${collapsed ? 'justify-center' : ''}`}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/10 text-xs font-semibold text-sidebar-primary">{email?.slice(0, 2).toUpperCase() || 'GA'}</span>
          <div className={`${collapsed ? 'hidden' : 'min-w-0'} max-md:hidden`}>
            <p className="truncate text-sm font-semibold text-sidebar-foreground">Garage Admin</p>
            <p className="truncate text-xs text-muted-foreground">{email || 'admin@garageos.com'}</p>
          </div>
          {!collapsed && <Button variant="ghost" size="icon" onClick={handleSignOut} className="ml-auto size-8 text-muted-foreground" aria-label="Sign out"><LogOut className="size-4" /></Button>}
        </div>
      </div>
    </aside>
    </>
  )
}
