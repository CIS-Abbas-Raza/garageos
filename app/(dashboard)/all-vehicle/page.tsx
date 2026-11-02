import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function AllVehiclesPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'vehicles',
        apiEndpoint: '/backend-api/vehicles',
        companyScoped: true,
        hideCreateButton: true,
        hideRowActions: false,
        title: 'All Vehicles',
        description: 'Vehicles belonging to customers of the company selected in the sidebar.',
        fields: [],
        columns: ['customer_name', 'make', 'model', 'year', 'VIN', 'insured', 'status'],
        empty: 'No vehicles found for the selected company.',
      }}
    />
  )
}
