import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function InvoicePaymentsPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'invoicePayments',
        apiEndpoint: '/backend-api/invoice-payments',
        title: 'Invoice Payments',
        description: 'Record payments and keep balances visible for every invoice.',
        hideCreateButton: true,
        updateFields: ['payment_status'],
        fileUrlPrefix: '/payment_proof_images/',
        fields: [
          {
            key: 'payment_status',
            label: 'Payment status',
            type: 'select',
            options: ['pending', 'not_verified', 'verified', 'rejected'],
            required: true,
          },
        ],
        columns: ['invoice_number', 'amount', 'payment_method', 'payment_status', 'date'],
        empty: 'No payments recorded.',
      }}
    />
  )
}
