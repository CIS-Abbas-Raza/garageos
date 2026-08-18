import { TaskCardFormPage } from '@/components/task-cards/task-card-form-page'

export default function EditTaskCardPage({ params }: { params: { id: string } }) {
  return <TaskCardFormPage mode="edit" taskCardId={params.id} />
}
