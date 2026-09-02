import { InvoiceFormPage } from '@/components/invoices/invoice-form-page'

type EditInvoicePageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = await params
  return <InvoiceFormPage mode="edit" invoiceId={id} />
}
