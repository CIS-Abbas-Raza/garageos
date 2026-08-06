'use client'

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Calendar,
  FileText,
  Home,
  Package,
  Settings,
  Users,
  Wrench,
  Truck,
  Bell,
  ChevronLeft,
  LogOut,
  Building2,
  UserCog,
  ShieldCheck,
  ClipboardList,
  CreditCard,
  Boxes,
  UserRoundCog,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/users", label: "Users", icon: Users },
  { href: "/company-users", label: "Company Users", icon: UserCog },
  { href: "/roles", label: "Roles", icon: ShieldCheck },
  { href: "/packages", label: "Packages", icon: ClipboardList },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/vehicles", label: "Vehicles", icon: Truck },
  { href: "/job-cards", label: "Job Cards", icon: FileText },
  { href: "/quotations", label: "Quotations", icon: ClipboardList },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/invoice-payments", label: "Invoice Payments", icon: CreditCard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/parts", label: "Parts", icon: Boxes },
  { href: "/suppliers", label: "Suppliers", icon: Truck },
  { href: "/mechanics", label: "Mechanics", icon: UserRoundCog },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/sales-report", label: "Sales Report", icon: BarChart3 },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/expenses", label: "Expenses", icon: CreditCard },
  { href: "/reviews", label: "Reviews", icon: FileText },
  { href: "/communication-settings", label: "Communications", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserRoundCog },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`border-r border-border bg-sidebar flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <Wrench className="h-5 w-5 text-sidebar-primary" />
            <span className="text-sm">GarageOS</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 ${collapsed ? "px-2" : ""}`}
                  title={collapsed ? item.label : ""}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <Button
          variant="ghost"
          className={`w-full justify-start gap-3 ${collapsed ? "px-2" : ""}`}
          title={collapsed ? "Sign out" : ""}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Sign out</span>}
        </Button>
      </div>
    </aside>
  );
}
