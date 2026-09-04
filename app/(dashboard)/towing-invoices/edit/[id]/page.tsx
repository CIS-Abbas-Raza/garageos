import { InvoiceFormPage } from '@/components/invoices/invoice-form-page'

export default function EditTowingInvoicePage({ params }: { params: { id: string } }) {
  return <InvoiceFormPage mode="edit" invoiceId={params.id} />
}
