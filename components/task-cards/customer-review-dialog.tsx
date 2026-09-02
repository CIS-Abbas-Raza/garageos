'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  taskCardId?: string | number
  companyId?: string | number
  onOpenChange: (open: boolean) => void
}

export function CustomerReviewDialog({ taskCardId, companyId, onOpenChange }: Props) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const close = () => {
    setRating(0)
    setReview('')
    onOpenChange(false)
  }

  const submit = async () => {
    if (!taskCardId || !companyId || !user) {
      toast.error('Select a company and sign in before creating a review.')
      return
    }
    if (!rating) {
      toast.error('Select a star rating.')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/backend-api/customer-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_card_id: taskCardId,
          company_id: companyId,
          rating,
          review: review.trim() || null,
          status: 1,
          created_by: user.id,
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.success === false) {
        throw new Error(result.message || result.error || 'Unable to create customer review.')
      }
      toast.success('Customer review created.')
      close()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create customer review.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={Boolean(taskCardId)} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customer Review</DialogTitle>
          <DialogDescription>Add a rating and optional notes for this task card.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={rating === star}
                  aria-label={`${star} star${star === 1 ? '' : 's'}`}
                  onClick={() => setRating(star)}
                  className="rounded p-1 text-amber-400 hover:bg-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Star className={`size-7 ${star <= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-review-notes">Notes</Label>
            <Textarea id="customer-review-notes" value={review} onChange={(event) => setReview(event.target.value)} placeholder="Write customer feedback..." rows={5} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>Cancel</Button>
          <Button type="button" onClick={() => void submit()} disabled={isSaving || !rating}>{isSaving ? 'Saving...' : 'Save Review'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
