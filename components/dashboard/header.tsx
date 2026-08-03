'use client'

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, Plus, Search } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  onNewClick?: () => void;
}

export function DashboardHeader({ title, onNewClick }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6 gap-4">
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-xl font-semibold">{title}</h1>
          <div className="hidden md:block flex-1 max-w-xs">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search customers, vehicles, jobs..."
                className="pl-9 bg-card w-full px-3 py-2 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNewClick && (
            <Button size="sm" onClick={onNewClick} className="gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Job</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
