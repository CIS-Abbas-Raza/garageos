import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

// ⚠️ SPEC FLAG 1: The Company spec has no 'name' field — only a 'user' owner dropdown.
// A 'name' field has been added to exactFields.companies for listing display.
// Confirm with team whether a dedicated name field is intended or if the owner's name
// should be used as the row identifier instead.
//
// ⚠️ SPEC FLAG 2: registration_no is specified as type 'number' on Create but 'text' on Update.
// This has been implemented exactly as specified using the updateType mechanism.
// This inconsistency is unusual — confirm with team whether it's intentional.

export default function CompaniesPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'companies',
        apiEndpoint: '/backend-api/companies',
        title: 'Companies',
        description: 'Manage garage companies, branches, and platform access.',
        fields: [],
        columns: ['owner_id', 'country', 'phone', 'registration_no', 'status'],
        empty: 'No companies configured yet.'
      }}
    />
  )
}
