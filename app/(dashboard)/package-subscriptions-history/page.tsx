'use client'

import { useState } from 'react'
import { Building2, History } from 'lucide-react'
import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'
import { CompanySettingsTab } from '@/components/package-subscriptions/company-settings-tab'

export default function PackageSubscriptionsHistoryPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'history'>('company')

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-5">
        <p className="text-sm font-medium text-primary">Company</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Company Account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage company details and review subscription history.</p>
      </div>

      <div className="mb-6 inline-flex rounded-lg border border-border bg-muted/30 p-1">
        <button type="button" onClick={() => setActiveTab('company')} className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'company' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          <Building2 className="size-4" /> Company Setting
        </button>
        <button type="button" onClick={() => setActiveTab('history')} className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'history' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          <History className="size-4" /> Subscription History
        </button>
      </div>

      {activeTab === 'company' ? <CompanySettingsTab /> : (
        <EntityCrudPage
          flush
          config={{
            resource: 'packageSubscriptions',
            apiEndpoint: '/backend-api/package-histories',
            companyScoped: true,
            title: 'Package Subscriptions',
            description: 'View package subscription history for the company selected in the sidebar.',
            fields: [],
            columns: ['company_name', 'package_name', 'package_type', 'amount', 'start_date', 'end_date', 'payment_status', 'status'],
            empty: 'No package subscription history found for the selected company.',
          }}
        />
      )}
    </div>
  )
}
