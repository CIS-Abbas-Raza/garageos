import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function CustomersPage() {
  return <EntityCrudPage config={{ resource: 'customers', title: 'Customers', description: 'Manage customer information, contact details, and service history.', fields: [{ key: 'firstName', label: 'First name', required: true }, { key: 'lastName', label: 'Last name', required: true }, { key: 'email', label: 'Email', type: 'email', required: true }, { key: 'phone', label: 'Phone', required: true }, { key: 'address', label: 'Address' }, { key: 'city', label: 'City' }, { key: 'state', label: 'State' }], columns: ['firstName', 'lastName', 'email', 'phone', 'address'], empty: 'No customers yet.' }} />
}
