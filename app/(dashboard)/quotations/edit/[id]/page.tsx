import { QuotationFormPage } from '@/components/quotations/quotation-form-page'

export default async function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <QuotationFormPage mode="edit" quotationId={id} />
}
