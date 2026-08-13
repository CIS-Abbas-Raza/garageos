import { EntityCrudPage } from '@/components/dashboard/entity-crud-page'

// ⚠️ SPEC FLAG: No customer-link field is present in the spec reviews fields —
// confirm whether this should reference which Customer or job card the review belongs to.

export default function ReviewsPage() {
  return (
    <EntityCrudPage
      config={{
        resource: 'reviews',
        title: 'Customer Reviews',
        description: 'Moderate customer feedback and highlight great service.',
        fields: [],
        columns: ['rating', 'review', 'status'],
        empty: 'No reviews to moderate.'
      }}
    />
  )
}
