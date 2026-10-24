import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function DemoBookingsPage() {
  return <EntityCrudPage config={{ resource: 'demoBookings', apiEndpoint: '/backend-api/demo-bookings', title: 'Demo Booking', description: 'View product demo booking requests.', hideCreateButton: true, hideRowActions: true, hideStatusFilter: true, fields: [{ key: 'name', label: 'Name', required: true }, { key: 'company_name', label: 'Company name', required: true }, { key: 'country', label: 'Country', required: true }, { key: 'phone', label: 'Phone', type: 'text', required: true }, { key: 'email', label: 'Email', type: 'email', required: true }], columns: ['name', 'company_name', 'country', 'phone', 'email', 'createdAt'], empty: 'No demo bookings yet.' }} />
}
