import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function PurchaseOrdersPage() {
  return <EntityCrudPage config={{ resource: 'purchaseOrders', title: 'Purchase Orders', description: 'Create and track supplier purchase orders from draft to receipt.', fields: [{ key: 'supplierId', label: 'Supplier', required: true }, { key: 'total', label: 'Total', type: 'number', required: true }, { key: 'status', label: 'Status', type: 'select', options: ['draft', 'sent', 'received', 'cancelled'], required: true }, { key: 'dueDate', label: 'Due date', type: 'date' }, { key: 'notes', label: 'Notes', type: 'textarea' }], columns: ['supplierId', 'total', 'status', 'dueDate'], empty: 'No purchase orders yet.' }} />
}
