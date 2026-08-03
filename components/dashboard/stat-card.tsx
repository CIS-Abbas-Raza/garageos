import { TrendingUp, TrendingDown } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ title, value, change, icon, trend = "up" }: StatCardProps) {
  const isPositive = change > 0;
  const trendColor = isPositive ? "text-green-500" : "text-red-500";
  const bgColor = isPositive ? "bg-green-500/10" : "bg-red-500/10";

  return (
    <div className="p-6 space-y-4 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${bgColor}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${trendColor}`}>
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>
            {isPositive ? "+" : ""}
            {change} vs last month
          </span>
        </div>
      </div>
    </div>
  );
}
