import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

export default function RoleAssignmentsPage() {
  return <EntityCrudPage config={{ resource: 'roleAssignments', title: 'Role Assignments', description: 'Manage user roles, scope, and access assignments.', fields: [{ key: 'user', label: 'User', required: true }, { key: 'role', label: 'Role', type: 'select', options: ['Admin', 'Manager', 'Technician', 'Viewer'], required: true }, { key: 'scope', label: 'Scope', type: 'select', options: ['System', 'Company', 'Location'], required: true }, { key: 'active', label: 'Active', type: 'checkbox' }], columns: ['user', 'role', 'scope', 'active'], empty: 'No role assignments yet.' }} />
}
