import { InvoiceFormPage } from '@/components/invoices/invoice-form-page'

type EditTowingInvoicePageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditTowingInvoicePage({ params }: EditTowingInvoicePageProps) {
  const { id } = await params
  return <InvoiceFormPage mode="edit" invoiceId={id} variant="towing" />
}
