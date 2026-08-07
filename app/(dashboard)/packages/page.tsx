import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function PackagesPage() {
  return <EntityCrudPage config={{ resource: 'packages', title: 'Packages', description: 'Create reusable service packages for estimates and job cards.', fields: [{ key: 'name', label: 'Package name', required: true }, { key: 'price', label: 'Starting price', type: 'number', required: true }, { key: 'duration', label: 'Duration', required: true }, { key: 'description', label: 'Description' }], columns: ['name', 'price', 'duration', 'description'], empty: 'No packages yet.' }} />
}
