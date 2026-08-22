import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function CustomersPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'customers',
        apiEndpoint: '/backend-api/customers',
        companyScoped: true,
        assignCurrentUserId: true,
        title: 'Customers',
        description: 'Manage customer contact records and service history.',
        fields: [],
        columns: ['name', 'phone', 'address', 'status'],
        empty: 'No customers configured yet.'
      }}
    />
  )
}
