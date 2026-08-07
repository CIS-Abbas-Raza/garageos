import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function JobCardsPage() {
  return <EntityCrudPage config={{ resource: 'jobCards', title: 'Job Cards', description: 'Create and track all service jobs with priority and status management.', fields: [{ key: 'description', label: 'Description', required: true }, { key: 'customerId', label: 'Customer ID', required: true }, { key: 'vehicleId', label: 'Vehicle ID', required: true }, { key: 'status', label: 'Status', type: 'select', options: ['pending', 'in-progress', 'completed', 'on-hold'], required: true }, { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'], required: true }, { key: 'total', label: 'Total Hours', type: 'number', required: true }, { key: 'dueDate', label: 'Due date', type: 'date' }], columns: ['description', 'status', 'priority', 'total', 'dueDate'], empty: 'No job cards yet.' }} />
}
