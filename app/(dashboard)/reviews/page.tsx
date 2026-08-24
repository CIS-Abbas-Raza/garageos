import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

// ⚠️ SPEC FLAG: No customer-link field is present in the spec reviews fields —
// confirm whether this should reference which Customer or job card the review belongs to.

export default function ReviewsPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'reviews',
        apiEndpoint: '/backend-api/customer-reviews',
        companyScoped: true,
        title: 'Customer Reviews',
        description: 'Moderate customer feedback and highlight great service.',
        hideCreateButton: true,
        hideEditAction: true,
        fields: [],
        columns: ['task_card_number', 'rating', 'review'],
        empty: 'No reviews to moderate.'
      }}
    />
  )
}
