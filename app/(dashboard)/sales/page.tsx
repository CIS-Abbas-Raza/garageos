import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function SalesPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'sales',
        apiEndpoint: '/backend-api/sales',
        companyScoped: true,
        title: 'Sales',
        description: 'Sales records for the selected company.',
        hideCreateButton: true,
        hideRowActions: true,
        fields: [],
        columns: ['invoice_number', 'amount', 'status', 'createdAt'],
        empty: 'No sales recorded for this company.',
      }}
    />
  )
}
