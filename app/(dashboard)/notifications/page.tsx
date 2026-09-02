import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function NotificationsRoute() {
  return <EntityCrudPage config={{ resource: 'notifications', apiEndpoint: '/backend-api/notifications', companyScoped: true, title: 'Notifications', description: 'Notifications for the company selected in the sidebar.', hideCreateButton: true, hideRowActions: true, fields: [], columns: ['text', 'user_name', 'read', 'createdAt'], empty: 'No notifications found for the selected company.' }} />
}
