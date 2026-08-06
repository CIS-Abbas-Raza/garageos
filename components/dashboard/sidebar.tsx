'use client'

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { toast } from "sonner";
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

const menuSections = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
    ]
  },
  {
    label: "Administration",
    items: [
      { href: "/admin", label: "Admin", icon: ShieldCheck },
      { href: "/companies", label: "Companies", icon: Building2 },
      { href: "/users", label: "Users", icon: Users },
      { href: "/company-users", label: "Company Users", icon: UserCog },
      { href: "/roles", label: "Roles", icon: ShieldCheck },
      { href: "/settings", label: "Settings", icon: Settings },
    ]
  },
  {
    label: "Company Management",
    items: [
      { href: "/customers", label: "Customers", icon: Users },
      { href: "/mechanics", label: "Mechanics", icon: UserRoundCog },
      { href: "/packages", label: "Packages", icon: ClipboardList },
      { href: "/appointments", label: "Appointments", icon: Calendar },
    ]
  },
  {
    label: "Operations",
    items: [
      { href: "/vehicles", label: "Vehicles", icon: Truck },
      { href: "/job-cards", label: "Job Cards", icon: FileText },
      { href: "/quotations", label: "Quotations", icon: ClipboardList },
      { href: "/inventory", label: "Inventory", icon: Package },
    ]
  },
  {
    label: "Finance & Billing",
    items: [
      { href: "/invoices", label: "Invoices", icon: FileText },
      { href: "/invoice-payments", label: "Invoice Payments", icon: CreditCard },
      { href: "/expenses", label: "Expenses", icon: CreditCard },
      { href: "/sales-report", label: "Sales Report", icon: BarChart3 },
    ]
  },
  {
    label: "Supply Chain",
    items: [
      { href: "/parts", label: "Parts", icon: Boxes },
      { href: "/suppliers", label: "Suppliers", icon: Truck },
    ]
  },
  {
    label: "Other",
    items: [
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/reviews", label: "Reviews", icon: FileText },
      { href: "/communication-settings", label: "Communications", icon: Bell },
      { href: "/profile", label: "Profile", icon: UserRoundCog },
    ]
  },
];

export function DashboardSidebar() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Main": true,
    "Administration": false,
    "Company Management": false,
    "Operations": false,
    "Finance & Billing": false,
    "Supply Chain": false,
    "Other": false,
  });

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleSignOut = () => {
    logout();
    toast.success("You have been signed out.");
    router.push("/login");
  };

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
        <div className="space-y-2 px-2">
          {menuSections.map((section) => (
            <div key={section.label}>
              <button
                onClick={() => toggleSection(section.label)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors ${
                  collapsed ? "px-1.5" : ""
                }`}
                title={collapsed ? section.label : ""}
              >
                {!collapsed && section.label}
                {!collapsed && (
                  <ChevronLeft
                    className={`h-3 w-3 transition-transform ${
                      expandedSections[section.label] ? "-rotate-90" : ""
                    }`}
                  />
                )}
              </button>
              {!collapsed && expandedSections[section.label] && (
                <div className="space-y-1 ml-2 mt-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 text-xs"
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{item.label}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              )}
              {collapsed && (
                <div className="space-y-1 mt-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href} title={item.label}>
                        <Button
                          variant="ghost"
                          className="w-full justify-center px-2"
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <Button
          variant="ghost"
          className={`w-full justify-start gap-3 ${collapsed ? "px-2" : ""}`}
          title={collapsed ? "Sign out" : ""}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Sign out</span>}
        </Button>
      </div>
    </aside>
  );
}
