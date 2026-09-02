import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function RolesPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'roles',
        apiEndpoint: '/backend-api/roles',
        title: 'Roles',
        description: 'Define permission sets for advisors, mechanics, and administrators.',
        fields: [],
        columns: ['name', 'status'],
        empty: 'No roles configured yet.'
      }}
    />
  )
}
