'use client'

import { useState } from 'react'
import { FileText, Truck } from 'lucide-react'
import { InvoicesPage } from '../invoices/page'

export default function AllInvoicesPage() {
  const [activeTab, setActiveTab] = useState<'service' | 'towing'>('service')

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <div className="inline-flex rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setActiveTab('service')}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'service' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <FileText className="size-4" />
            Service Invoices
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('towing')}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'towing' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Truck className="size-4" />
            Towing Invoices
          </button>
        </div>
      </div>
      <InvoicesPage showAll invoiceType={activeTab} />
    </>
  )
}
