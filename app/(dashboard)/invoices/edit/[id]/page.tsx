import { InvoiceFormPage } from '@/components/invoices/invoice-form-page'

type EditInvoicePageProps = {
  params: {
    id: string
  }
}

export default function EditInvoicePage({ params }: EditInvoicePageProps) {
  return <InvoiceFormPage mode="edit" invoiceId={params.id} />
}
