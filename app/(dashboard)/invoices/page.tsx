import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function InvoicesPage() {
  return <EntityCrudPage config={{ resource: 'invoices', title: 'Invoices', description: 'Generate invoices, track payments, and manage billing history.', fields: [{ key: 'invoiceNumber', label: 'Invoice number', required: true }, { key: 'customerId', label: 'Customer ID', required: true }, { key: 'date', label: 'Date', type: 'date', required: true }, { key: 'amount', label: 'Amount', type: 'number', required: true }, { key: 'status', label: 'Status', type: 'select', options: ['draft', 'sent', 'paid', 'overdue'], required: true }, { key: 'dueDate', label: 'Due date', type: 'date' }], columns: ['invoiceNumber', 'customerId', 'date', 'amount', 'status'], empty: 'No invoices yet.' }} />
}
