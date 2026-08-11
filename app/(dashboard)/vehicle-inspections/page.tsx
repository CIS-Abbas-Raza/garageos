import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function VehicleInspectionsPage() {
  return <EntityCrudPage config={{ resource: 'vehicleInspections', title: 'Vehicle Inspections', description: 'Record inspection checklists and vehicle condition notes.', fields: [{ key: 'vehicleId', label: 'Vehicle', required: true }, { key: 'mileage', label: 'Mileage', type: 'number', required: true }, { key: 'inspectionDate', label: 'Inspection date', type: 'date', required: true }, { key: 'notes', label: 'Notes', type: 'textarea' }], columns: ['vehicleId', 'mileage', 'inspectionDate', 'notes'], empty: 'No inspections yet.' }} />
} 
