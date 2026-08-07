'use client'

import { CalendarDays, Clock3 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function DateTimeCard() {
  const [dateTime, setDateTime] = useState('')

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      setDateTime(`${date} at ${time}`)
    }
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6" aria-label="Current date and time">
      <div className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><CalendarDays className="size-6" /></div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">Current Date &amp; Time</p>
          <div className="mt-2 flex items-center gap-2 text-lg font-bold tracking-tight text-foreground sm:text-2xl">
            <span className="truncate">{dateTime || 'Loading...'}</span>
            <Clock3 className="hidden size-5 shrink-0 text-muted-foreground sm:block" />
          </div>
        </div>
      </div>
    </section>
  )
}
