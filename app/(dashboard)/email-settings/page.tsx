import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function EmailSettingsPage() {
  return <EntityCrudPage config={{ resource: 'emailSettings', title: 'Email Settings', description: 'Configure outbound email identity, replies, and notification defaults.', fields: [{ key: 'fromName', label: 'From name', required: true }, { key: 'fromEmail', label: 'From email', type: 'email', required: true }, { key: 'replyTo', label: 'Reply-to email', type: 'email' }, { key: 'active', label: 'Active', type: 'checkbox' }], columns: ['fromName', 'fromEmail', 'replyTo', 'active'], empty: 'No email settings configured.' }} />
}
