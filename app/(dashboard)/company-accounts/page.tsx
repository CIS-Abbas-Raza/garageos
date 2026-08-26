import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function CompanyAccountsPage() {
  return <EntityCrudPage config={{ resource: 'companyAccounts', apiEndpoint: '/backend-api/company-accounts', companyScoped: true, title: 'Company Accounts', description: 'Current account balances for the company selected in the sidebar.', hideCreateButton: true, hideRowActions: true, fields: [{ key: 'current_amount', label: 'Current Amount', type: 'number' }, { key: 'status', label: 'Status' }], columns: ['current_amount', 'status', 'updatedAt'], empty: 'No company account found for the selected company.' }} />
}
