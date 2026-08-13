import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function PackageSubscriptionsPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'packageSubscriptions',
        title: 'Package Subscriptions',
        description: 'Link companies to packages and track subscription periods.',
        fields: [],
        columns: ['company', 'package', 'start_date', 'end_date', 'status'],
        empty: 'No package subscriptions configured yet.'
      }}
    />
  )
}
