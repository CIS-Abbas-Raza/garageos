"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type RecordCount = {
  label: string
  value: number
  color?: "neutral" | "green" | "amber" | "red" | "blue"
}

const colorClasses = {
  neutral: "bg-gray-50 text-gray-600 border-gray-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
}

export function RecordCountBadges({ counts }: { counts: RecordCount[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Record counts">
      {counts.map((count) => (
        <Badge key={count.label} variant="outline" className={cn("rounded-full px-3 py-1 text-[11px] font-bold", colorClasses[count.color ?? "neutral"])}>
          {count.label}: {count.value}
        </Badge>
      ))}
    </div>
  )
}