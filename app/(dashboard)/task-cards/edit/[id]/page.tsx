import { TaskCardFormPage } from '@/components/task-cards/task-card-form-page'

export default async function EditTaskCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TaskCardFormPage mode="edit" taskCardId={id} />
}
