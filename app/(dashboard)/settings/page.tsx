'use client'

import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";


export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Settings" />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-7xl px-6 py-8">
            <div className="p-12 text-center rounded-lg border border-border bg-card">
              <h2 className="text-2xl font-semibold mb-2">Settings</h2>
              <p className="text-muted-foreground">This section is coming soon. Manage your account and workspace settings here.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
