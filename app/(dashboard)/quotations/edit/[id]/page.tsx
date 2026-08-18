import { QuotationFormPage } from '@/components/quotations/quotation-form-page'

export default async function EditQuotationPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  return <QuotationFormPage mode="edit" quotationId={id} />
}
