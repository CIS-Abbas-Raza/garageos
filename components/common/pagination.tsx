"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
  return (
    <div className="flex items-center gap-1.5" aria-label="Pagination">
      <Button variant="outline" size="icon" className="size-9" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft className="size-4" />
      </Button>
      {pages.map((pageNumber) => (
        <Button key={pageNumber} variant={pageNumber === page ? "default" : "outline"} size="icon" className="size-9" onClick={() => onPageChange(pageNumber)} aria-label={`Page ${pageNumber}`} aria-current={pageNumber === page ? "page" : undefined}>
          {pageNumber}
        </Button>
      ))}
      <Button variant="outline" size="icon" className="size-9" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}