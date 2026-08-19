import { VehiclePicturesPage } from '@/components/task-cards/vehicle-pictures-page'

export default async function TaskCardVehiclePicturesRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <VehiclePicturesPage taskCardId={id} />
}
