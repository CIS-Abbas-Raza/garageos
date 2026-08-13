"use client"

import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonProps {
    columns?: number
    rows?: number
}

export function TableSkeleton({ columns = 5, rows = 8 }: TableSkeletonProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-10 w-[100px] ml-auto" />
            </div>
            <div className="rounded-md border">
                <div className="border-b px-4 py-3 flex gap-4">
                    {Array.from({ length: columns }).map((_, i) => (
                        <Skeleton key={i} className="h-4 flex-1" />
                    ))}
                </div>
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="border-b last:border-0 px-4 py-3 flex gap-4 items-center">
                        {Array.from({ length: columns }).map((_, j) => (
                            <Skeleton key={j} className="h-4 flex-1" style={{ opacity: 1 - i * 0.08 }} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}
