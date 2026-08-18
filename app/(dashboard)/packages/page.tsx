import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function PackagesPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'packages',
        apiEndpoint: '/backend-api/packages',
        title: 'Packages',
        description: 'Create reusable service packages for estimates and job cards.',
        fields: [
          { key: 'name', label: 'Name', required: true },
          { key: 'monthly', label: 'Monthly Price', type: 'number', required: true },
          { key: 'yearly', label: 'Yearly Price', type: 'number', required: true },
          { key: 'information', label: 'Information', type: 'dynamic-list', required: true }
        ],
        columns: ['name', 'monthly', 'yearly', 'information'],
        empty: 'No packages configured.'
      }}
    />
  )
}
