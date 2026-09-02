import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function CommunicationLogsPage() {
  return <EntityCrudPage config={{ resource: 'communicationLogs', apiEndpoint: '/backend-api/communication-logs', companyScoped: true, title: 'Communication Logs', description: 'Email, WhatsApp, and SMS activity for the company selected in the sidebar.', hideCreateButton: true, hideRowActions: true, fields: [], columns: ['channel', 'user_name', 'status', 'createdAt'], empty: 'No communication logs found for the selected company.' }} />
}
