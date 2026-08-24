import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function AppointmentsPage() {
  return <EntityCrudPage config={{
    resource: 'appointments',
    apiEndpoint: '/backend-api/appointments',
    companyScoped: true,
    assignCurrentUserId: true,
    title: 'Appointments',
    description: 'Schedule customer visits and keep every bay accounted for.',
    fields: [],
    columns: ['customer_name', 'customer_phone', 'reservation_date', 'status'],
    empty: 'No appointments scheduled for the selected company.',
  }} />
}
