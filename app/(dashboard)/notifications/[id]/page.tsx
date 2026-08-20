import { ViewNotificationPage } from '@/components/notifications/view-notification-page'

export default async function ViewNotificationRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ViewNotificationPage notificationId={id} />
}