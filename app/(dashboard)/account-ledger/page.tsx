import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function AccountLedgerPage() {
  return <EntityCrudPage config={{ resource: 'companyExpenses', apiEndpoint: '/backend-api/company-expenses', companyScoped: true, assignCurrentUserId: true, title: 'Account Ledger', description: 'Debit and credit entries for the company selected in the sidebar.', hideRowActions: true, fields: [{ key: 'transaction_type', label: 'Transaction Type', type: 'select', required: true, options: [{ label: 'Debit', value: 'Debit' }, { label: 'Credit', value: 'Credit' }] }, { key: 'amount', label: 'Amount', type: 'number', required: true }, { key: 'reason', label: 'Reason', type: 'textarea', required: true }], columns: ['transaction_type', 'reason', 'amount', 'balance', 'created_by_name', 'createdAt'], empty: 'No ledger entries found for the selected company.' }} />
}
