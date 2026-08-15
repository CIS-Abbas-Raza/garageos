'use client'

import { CalendarDays, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

export function DateTimeCard() {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      )
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Current date and time">
      {/* Date Card */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
          <CalendarDays className="size-5 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[17px] font-bold tracking-tight text-gray-900">
            {date || '—'}
          </p>
          <p className="mt-0.5 text-[13px] text-gray-400 font-medium">Today's Date</p>
        </div>
      </div>

      {/* Time Card */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-6 py-7 shadow-sm">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
          <Clock className="size-5 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[17px] font-bold tracking-tight text-gray-900">
            {time || '—'}
          </p>
          <p className="mt-0.5 text-[13px] text-gray-400 font-medium">Current Time</p>
        </div>
      </div>
    </div>
  )
}
