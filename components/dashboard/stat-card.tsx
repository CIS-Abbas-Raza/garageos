import { TrendingDown, TrendingUp } from 'lucide-react'
import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  change: number
  icon: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  accent?: 'blue' | 'green' | 'amber' | 'red'
}

const accentStyles = {
  blue: 'bg-primary/10',
  green: 'bg-green-500/10',
  amber: 'bg-amber-500/10',
  red: 'bg-destructive/10',
}

export function StatCard({ title, value, change, icon, trend = 'up', accent = 'blue' }: StatCardProps) {
  const isPositive = change > 0
  const isNeutral = change === 0 || trend === 'neutral'
  const trendColor = isNeutral ? 'text-muted-foreground' : isPositive ? 'text-green-500' : 'text-destructive'
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <article className="flex min-h-44 flex-col rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="pt-1 text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${accentStyles[accent]}`}>{icon}</div>
      </div>
      <div className="mt-auto pt-8">
        <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
        <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${trendColor}`}>
          <TrendIcon className="size-3.5" />
          <span>{isPositive ? '+' : ''}{change} vs last month</span>
        </div>
      </div>
    </article>
  )
}
