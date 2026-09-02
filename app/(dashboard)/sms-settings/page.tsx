import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function SmsSettingsPage() {
  return <EntityCrudPage config={{
    resource: 'smsSettings',
    apiEndpoint: '/backend-api/twilio-sms-settings',
    companyScoped: true,
    assignCurrentUserId: true,
    title: 'SMS Settings',
    description: 'Configure the Twilio credentials used for SMS notifications.',
    fields: [
      { key: 'company_id', label: 'Company', type: 'select', required: true, optionsEndpoint: '/backend-api/companies' },
      { key: 'sms_account_sid', label: 'SMS Account SID', required: true },
      { key: 'sms_auth_token', label: 'SMS Auth Token', type: 'password', required: true },
      { key: 'sms_from_number', label: 'SMS From Number', required: true },
      { key: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: '1' }, { label: 'Inactive', value: '0' }] },
    ],
    columns: ['company_name', 'sms_account_sid', 'sms_from_number', 'status'],
    empty: 'No SMS settings configured.',
  }} />
}
