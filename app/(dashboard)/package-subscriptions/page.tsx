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
        columns: ['company_name', 'package_name', 'package_type', 'amount', 'start_date', 'end_date', 'payment_status', 'status'],
        empty: 'No package subscriptions configured yet.'
      }}
    />
  )
}
