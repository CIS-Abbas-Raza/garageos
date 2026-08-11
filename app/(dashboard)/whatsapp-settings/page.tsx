import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function WhatsappSettingsPage() {
  return <EntityCrudPage config={{ resource: 'whatsappSettings', title: 'WhatsApp Settings', description: 'Configure WhatsApp business messaging and templates.', fields: [{ key: 'businessName', label: 'Business name', required: true }, { key: 'phoneNumber', label: 'Phone number', required: true }, { key: 'templatePrefix', label: 'Template prefix' }, { key: 'active', label: 'Active', type: 'checkbox' }], columns: ['businessName', 'phoneNumber', 'templatePrefix', 'active'], empty: 'No WhatsApp settings configured.' }} />
}
