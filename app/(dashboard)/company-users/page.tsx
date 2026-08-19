import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

// Role field uses a fixed list: Mechanic / Finance (as per spec).
// If roles should be pulled dynamically from the Role module, that is a follow-up
// question for the team — not assumed here.

export default function CompanyUsersPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'companyUsers',
        apiEndpoint: '/backend-api/company-users',
        companyScoped: true,
        title: 'Company Employees',
        description: 'Assign staff members to roles and keep team details current.',
        fields: [],
        columns: ['name', 'country', 'phone', 'role', 'status'],
        empty: 'No company employees configured yet.'
      }}
    />
  )
}
