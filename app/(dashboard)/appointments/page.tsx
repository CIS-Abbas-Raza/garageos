import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function AppointmentsPage() {
  return <EntityCrudPage config={{ resource: 'appointments', title: 'Appointments', description: 'Schedule customer visits and keep every bay accounted for.', fields: [{ key: 'title', label: 'Appointment title', required: true }, { key: 'customerId', label: 'Customer ID', required: true }, { key: 'vehicleId', label: 'Vehicle ID', required: true }, { key: 'startTime', label: 'Start date', type: 'date', required: true }, { key: 'status', label: 'Status', type: 'select', options: ['pending', 'confirmed', 'cancelled', 'completed'], required: true }], columns: ['title', 'customerId', 'startTime', 'status'], empty: 'No appointments scheduled.' }} />
}
