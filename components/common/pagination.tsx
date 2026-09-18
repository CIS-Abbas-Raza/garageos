"use client"

import { Fragment } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from(new Set([
    1,
    ...Array.from({ length: 5 }, (_, index) => page - 2 + index).filter((value) => value > 1 && value < totalPages),
    totalPages,
  ])).sort((left, right) => left - right)

  return (
    <div className="flex max-w-full items-center gap-1 overflow-x-auto pb-1" aria-label="Pagination">
      <Button variant="outline" size="icon" className="size-9" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft className="size-4" />
      </Button>
      {pages.map((pageNumber, index) => (
        <Fragment key={pageNumber}>
          {index > 0 && pageNumber - pages[index - 1] > 1 && <span className="px-1 text-sm text-muted-foreground" aria-hidden="true">…</span>}
          <Button variant={pageNumber === page ? "default" : "outline"} size="icon" className="size-9 shrink-0" onClick={() => onPageChange(pageNumber)} aria-label={`Page ${pageNumber}`} aria-current={pageNumber === page ? "page" : undefined}>
            {pageNumber}
          </Button>
        </Fragment>
      ))}
      <Button variant="outline" size="icon" className="size-9" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
