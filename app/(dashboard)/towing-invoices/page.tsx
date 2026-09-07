import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function TowingInvoicesPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'towingInvoices',
        apiEndpoint: '/backend-api/towing-invoices',
        vehicleScoped: true,
        paymentType: 'towing',
        hideViewAction: true,
        hideStatusAction: true,
        createPath: '/towing-invoices/create',
        title: 'Towing Invoices',
        description: 'Manage towing invoices generated for vehicle transports.',
        fields: [],
        columns: ['invoice_number', 'invoice_status', 'payment_status', 'total', 'balance_amount', 'creation_date', 'status'],
        empty: 'No towing invoices configured yet.'
      }}
    />
  )
}
