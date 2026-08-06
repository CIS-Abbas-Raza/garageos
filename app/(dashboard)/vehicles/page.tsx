import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function VehiclesPage() {
  return <EntityCrudPage config={{ resource: 'vehicles', title: 'Vehicles', description: 'Track customer vehicles, maintenance history, and service records.', fields: [{ key: 'make', label: 'Make', required: true }, { key: 'model', label: 'Model', required: true }, { key: 'year', label: 'Year', type: 'number', required: true }, { key: 'licensePlate', label: 'License plate', required: true }, { key: 'customerId', label: 'Customer ID', required: true }, { key: 'vin', label: 'VIN' }], columns: ['make', 'model', 'year', 'licensePlate', 'customerId'], empty: 'No vehicles yet.' }} />
}
