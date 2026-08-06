import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function AdminPage() {
  return <EntityCrudPage config={{ resource: 'companies', title: 'Companies', description: 'Manage garage companies, branches, and platform access.', fields: [{ key: 'name', label: 'Company name', required: true }, { key: 'email', label: 'Owner email', type: 'email', required: true }, { key: 'phone', label: 'Phone' }, { key: 'city', label: 'City' }, { key: 'state', label: 'State' }], columns: ['name', 'email', 'city', 'active'], empty: 'No companies yet.' }} />
}
