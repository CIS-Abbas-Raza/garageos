import { AssignedTaskStatusForm } from '@/components/assigned-tasks/assigned-task-status-form'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AssignedTaskStatusForm assignmentId={id} />
}
