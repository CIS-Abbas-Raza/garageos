import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function InvoicePaymentsPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'invoicePayments',
        apiEndpoint: '/backend-api/invoice-payments',
        companyScoped: true,
        title: 'Invoice Payments',
        description: 'Record payments and keep balances visible for every invoice.',
        hideCreateButton: true,
        hideStatusAction: true,
        hideDeleteAction: true,
        updateFields: ['paid_amount', 'payment_status'],
        fileUrlPrefix: '/payment_proof_images/',
        fields: [
          { key: 'invoice_number', label: 'Invoice Number', readOnly: true },
          { key: 'total_amount', label: 'Total Amount', type: 'number', readOnly: true },
          { key: 'balance_amount', label: 'Balance Amount', type: 'number', readOnly: true },
          { key: 'paid_amount', label: 'Paid Amount', type: 'number', required: true },
          {
            key: 'payment_status',
            label: 'Payment status',
            type: 'select',
            options: [
              { label: 'Pending', value: 'pending' },
              { label: 'Verified', value: 'verified' },
              { label: 'Verified With Adjustment', value: 'verified_with_adjustment' },
              { label: 'Rejected', value: 'rejected' },
            ],
            required: true,
          },
        ],
        columns: ['invoice_number', 'invoice_type', 'amount', 'payment_method', 'payment_status', 'date'],
        empty: 'No payments recorded.',
      }}
    />
  )
}
