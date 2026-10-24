import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function NotificationsRoute() {
  return <EntityCrudPage config={{
    resource: 'notifications',
    apiEndpoint: '/backend-api/notifications',
    userScoped: true,
    title: 'Notifications',
    description: 'Notifications for your account.',
    hideCreateButton: true,
    hideRowActions: true,
    fields: [],
    columns: ['text', 'user_name', 'read', 'createdAt'],
    empty: 'No notifications found for your account.',
  }} />
}
