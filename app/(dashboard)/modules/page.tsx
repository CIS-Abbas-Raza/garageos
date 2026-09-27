import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function ModulesPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'modules',
        apiEndpoint: '/backend-api/modules',
        title: 'Modules',
        description: 'Create modules and manage their attached sub modules.',
        fields: [],
        columns: ['name', 'sub_modules', 'status'],
        empty: 'No modules configured yet.',
      }}
    />
  )
}
