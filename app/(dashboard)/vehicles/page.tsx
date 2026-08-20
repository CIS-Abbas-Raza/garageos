import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

// ⚠️ SPEC FLAG: Vehicles has no customer/owner link field — a vehicle with no customer
// relationship is unusual for a garage system. Implemented exactly as specified.
// Confirm with team whether a customer/owner link is needed.

export default function VehiclesPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'vehicles',
        apiEndpoint: '/backend-api/vehicles',
        customerScoped: true,
        assignCurrentUserId: true,
        title: 'Vehicles',
        description: 'Track customer vehicles, maintenance history, and service records.',
        fields: [],
        columns: ['name', 'year', 'license_plate', 'insured', 'status'],
        empty: 'No vehicles configured yet.'
      }}
    />
  )
}
