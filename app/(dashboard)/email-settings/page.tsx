import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function EmailSettingsPage() {
  return <EntityCrudPage config={{
    resource: 'emailSettings',
    apiEndpoint: '/backend-api/sendgrid-settings',
    companyScoped: true,
    assignCurrentUserId: true,
    title: 'Email Settings',
    description: 'Configure the SendGrid credentials used for outbound email.',
    fields: [
      { key: 'company_id', label: 'Company', type: 'select', required: true, optionsEndpoint: '/backend-api/companies' },
      { key: 'sendgrid_api_key', label: 'SendGrid API Key', type: 'password', required: true },
      { key: 'email', label: 'Sender Email', type: 'email', required: true },
      { key: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
    ],
    columns: ['company_name', 'email', 'status'],
    empty: 'No email settings configured.',
  }} />
}
