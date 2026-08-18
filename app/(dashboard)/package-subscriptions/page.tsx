import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function PackageSubscriptionsPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'packageSubscriptions',
        apiEndpoint: '/backend-api/package-histories',
        title: 'Package Subscriptions',
        description: 'Link companies to packages and track subscription periods.',
        fields: [],
        columns: ['company_id', 'package_id', 'start_date', 'end_date', 'status'],
        empty: 'No package subscriptions configured yet.'
      }}
    />
  )
}
