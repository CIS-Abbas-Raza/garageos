import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function UsersPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'employees',
        apiEndpoint: '/backend-api/users',
        updateFields: ['name', 'country', 'state', 'email', 'phone', 'address', 'status'],
        title: 'Users',
        description: 'Manage system users, their access and account details.',
        fields: [],
        columns: ['name', 'country', 'state', 'phone', 'status'],
        empty: 'No users configured yet.'
      }}
    />
  )
}
