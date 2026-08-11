import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function SmsSettingsPage() {
  return <EntityCrudPage config={{ resource: 'smsSettings', title: 'SMS Settings', description: 'Configure SMS sender details, templates, and notification behavior.', fields: [{ key: 'senderName', label: 'Sender name', required: true }, { key: 'provider', label: 'Provider', type: 'select', options: ['Twilio', 'MessageBird', 'Other'], required: true }, { key: 'phoneNumber', label: 'Phone number', required: true }, { key: 'active', label: 'Active', type: 'checkbox' }], columns: ['senderName', 'provider', 'phoneNumber', 'active'], empty: 'No SMS settings configured.' }} />
}
