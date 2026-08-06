import { useEffect, useState } from 'react'

export function DateTimeCard() {
  const [dateTime, setDateTime] = useState<string>('')

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }
      setDateTime(now.toLocaleDateString('en-US', options))
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Current Date & Time</p>
        <p className="text-lg font-semibold text-foreground">{dateTime || 'Loading...'}</p>
      </div>
    </div>
  )
}
