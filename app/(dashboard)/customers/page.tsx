import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

// ⚠️ SPEC FLAG: Customer has a password field — confirm with team whether customers
// need portal login credentials (this implies a customer-facing portal).
// Unusual for a garage's internal admin tool to set customer passwords directly.

export default function CustomersPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'customers',
        title: 'Customers',
        description: 'Manage customer contact records and service history.',
        fields: [],
        columns: ['name', 'phone', 'address', 'status'],
        empty: 'No customers configured yet.'
      }}
    />
  )
}
