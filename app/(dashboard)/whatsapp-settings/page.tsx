import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function WhatsappSettingsPage() {
  return <EntityCrudPage config={{
    resource: 'whatsappSettings',
    apiEndpoint: '/backend-api/twilio-whatsapp-settings',
    companyScoped: true,
    assignCurrentUserId: true,
    title: 'WhatsApp Settings',
    description: 'Configure the Twilio credentials used for WhatsApp notifications.',
    fields: [
      { key: 'company_id', label: 'Company', type: 'select', required: true, optionsEndpoint: '/backend-api/companies' },
      { key: 'whatsapp_account_sid', label: 'WhatsApp Account SID', required: true },
      { key: 'whatsapp_auth_token', label: 'WhatsApp Auth Token', type: 'password', required: true },
      { key: 'whatsapp_from_number', label: 'WhatsApp From Number', required: true },
      { key: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
    ],
    columns: ['company_name', 'whatsapp_account_sid', 'whatsapp_from_number', 'status'],
    empty: 'No WhatsApp settings configured.',
  }} />
}
