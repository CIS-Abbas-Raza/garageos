"use client"

import { useEffect, useRef, useState } from "react"
import { CalendarDays, X } from "lucide-react"
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { DateRangePicker, createStaticRanges, type RangeKeyDict } from "react-date-range"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import "react-date-range/dist/styles.css"
import "react-date-range/dist/theme/default.css"

export interface DateRangeValue {
  startDate: Date
  endDate: Date
}

interface DateRangeFilterProps {
  value?: DateRangeValue | null
  defaultValue?: DateRangeValue | null
  onChange: (value: DateRangeValue | null) => void
  className?: string
}

const presets = createStaticRanges([
  { label: "Today", range: () => ({ startDate: startOfDay(new Date()), endDate: endOfDay(new Date()) }) },
  { label: "Yesterday", range: () => { const day = subDays(new Date(), 1); return { startDate: startOfDay(day), endDate: endOfDay(day) } } },
  { label: "This Week", range: () => ({ startDate: startOfWeek(new Date()), endDate: endOfWeek(new Date()) }) },
  { label: "Last Week", range: () => { const day = subDays(new Date(), 7); return { startDate: startOfWeek(day), endDate: endOfWeek(day) } } },
  { label: "This Month", range: () => ({ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) }) },
  { label: "Last Month", range: () => { const day = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1); return { startDate: startOfMonth(day), endDate: endOfMonth(day) } } },
])

export function DateRangeFilter({ value, defaultValue = null, onChange, className }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState<DateRangeValue | null>(defaultValue)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = value === undefined ? internalValue : value

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false) }
    const handlePointerDown = (event: PointerEvent) => { if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false) }
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("pointerdown", handlePointerDown)
    return () => { document.removeEventListener("keydown", handleKeyDown); document.removeEventListener("pointerdown", handlePointerDown) }
  }, [])

  const update = (next: DateRangeValue | null) => { setInternalValue(next); onChange(next) }
  const label = selected ? `${format(selected.startDate, "MMM d, yyyy")} - ${format(selected.endDate, "MMM d, yyyy")}` : "Select date range"

  return <div ref={rootRef} className={cn("date-range-filter relative", className)}>
    <Button type="button" variant="outline" className="h-10 gap-2 rounded-lg bg-background text-sm font-medium" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-haspopup="dialog">
      <CalendarDays className="size-4 text-muted-foreground" />
      <span>{label}</span>
      {selected && <X className="size-4 text-muted-foreground" onClick={(event) => { event.stopPropagation(); update(null) }} aria-label="Clear date range" />}
    </Button>
    {open && <div className="absolute left-0 z-50 mt-2 max-w-[calc(100vw-1rem)] overflow-x-auto overflow-y-hidden rounded-xl border border-border bg-popover shadow-xl" role="dialog" aria-label="Date range picker">
      <DateRangePicker
        ranges={[{ key: "selection", startDate: selected?.startDate ?? new Date(), endDate: selected?.endDate ?? new Date(), color: "#3b82f6" }]}
        onChange={(ranges: RangeKeyDict) => { const range = ranges.selection; if (range.startDate && range.endDate) update({ startDate: range.startDate, endDate: range.endDate }) }}
        staticRanges={presets}
        inputRanges={[]}
        months={2}
        direction="horizontal"
        showDateDisplay={false}
        moveRangeOnFirstSelection={false}
        editableDateInputs={false}
      />
      <div className="flex justify-end border-t border-border bg-muted/30 p-2"><Button type="button" variant="ghost" size="sm" onClick={() => { update(null); setOpen(false) }}>Clear</Button><Button type="button" size="sm" onClick={() => setOpen(false)}>Apply</Button></div>
    </div>}
  </div>
}