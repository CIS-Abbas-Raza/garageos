import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function VehicleMaintenancePicturesPage() {
  return <EntityCrudPage config={{ resource: 'vehicleMaintenancePictures', title: 'Vehicle Maintenance Pictures', description: 'Manage before and after maintenance photos.', fields: [{ key: 'before_pictures', label: 'Before pictures', type: 'file', required: true, multiple: true }, { key: 'after_pictures', label: 'After pictures', type: 'file', required: true, multiple: true }], columns: ['before_pictures', 'after_pictures'], empty: 'No maintenance pictures yet.' }} />
}
