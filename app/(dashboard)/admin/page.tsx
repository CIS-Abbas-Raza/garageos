import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function AdminPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'admins',
        apiEndpoint: '/backend-api/admins',
        title: 'Admin',
        description: 'Manage admin users and access scopes.',
        fields: [
          { key: 'name', label: 'Name', required: true },
          { key: 'email', label: 'Email', type: 'email', required: true },
          { key: 'password', label: 'Password', type: 'password', required: true, optionalOnUpdate: true },
          { key: 'phone', label: 'Phone', required: true }
        ],
        columns: ['name', 'phone', 'status'],
        empty: 'No admin users configured.'
      }}
    />
  )
}
