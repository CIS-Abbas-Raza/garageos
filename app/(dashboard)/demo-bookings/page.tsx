import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function DemoBookingsPage() {
  return <EntityCrudPage config={{ resource: 'demoBookings', title: 'Demo Bookings', description: 'Manage product demo booking requests.', fields: [{ key: 'name', label: 'Name', required: true }, { key: 'company_name', label: 'Company name', required: true }, { key: 'country', label: 'Country', required: true }, { key: 'phone', label: 'Phone', type: 'number', required: true }, { key: 'email', label: 'Email', type: 'email', required: true }], columns: ['name', 'company_name', 'country', 'email'], empty: 'No demo bookings yet.' }} />
}
