import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function AllVehiclesPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'vehicles',
        apiEndpoint: '/backend-api/vehicles',
        companyScoped: true,
        hideCreateButton: true,
        hideRowActions: true,
        title: 'All Vehicles',
        description: 'Vehicles belonging to customers of the company selected in the sidebar.',
        fields: [],
        columns: ['make', 'model', 'year', 'VIN', 'license_plate', 'insured', 'status'],
        empty: 'No vehicles found for the selected company.',
      }}
    />
  )
}
