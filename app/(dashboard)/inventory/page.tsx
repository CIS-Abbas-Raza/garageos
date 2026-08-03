'use client'

import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";


export default function InventoryPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Inventory" onNewClick={() => {}} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto max-w-7xl px-6 py-8">
            <div className="p-12 text-center rounded-lg border border-border bg-card">
              <h2 className="text-2xl font-semibold mb-2">Inventory Management</h2>
              <p className="text-muted-foreground">This section is coming soon. Track parts and supplies inventory here.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
