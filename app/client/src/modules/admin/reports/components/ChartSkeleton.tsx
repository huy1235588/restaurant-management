'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ChartSkeletonProps {
    /** Height of the chart area in pixels */
    height?: number;
    /** Show title skeleton */
    showTitle?: boolean;
    /** Chart type for appropriate skeleton shape */
    type?: 'line' | 'bar' | 'pie' | 'horizontal-bar';
}

export function ChartSkeleton({
    height = 300,
    showTitle = true,
    type = 'line',
}: ChartSkeletonProps) {
    const renderChartSkeleton = () => {
        switch (type) {
            case 'pie':
                return (
                    <div className="flex items-center justify-center" style={{ height }}>
                        <Skeleton className="h-48 w-48 rounded-full" />
                    </div>
                );

            case 'horizontal-bar':
                return (
                    <div className="space-y-3" style={{ height }}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton
                                    className="h-6"
                                    style={{ width: `${Math.random() * 50 + 30}%` }}
                                />
                            </div>
                        ))}
                    </div>
                );

            case 'bar':
                return (
                    <div className="flex items-end justify-between gap-2" style={{ height }}>
                        {Array.from({ length: 12 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="flex-1"
                                style={{ height: `${Math.random() * 60 + 20}%` }}
                            />
                        ))}
                    </div>
                );

            case 'line':
            default:
                return (
                    <div className="relative" style={{ height }}>
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 flex h-full flex-col justify-between py-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-3 w-8" />
                            ))}
                        </div>
                        {/* Chart area */}
                        <div className="ml-12 h-full">
                            <Skeleton className="h-full w-full" />
                        </div>
                        {/* X-axis labels */}
                        <div className="ml-12 mt-2 flex justify-between">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <Skeleton key={i} className="h-3 w-10" />
                            ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <Card>
            {showTitle && (
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                </CardHeader>
            )}
            <CardContent>{renderChartSkeleton()}</CardContent>
        </Card>
    );
}

/**
 * Skeleton for report KPI cards
 */
export function ReportCardSkeleton() {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
            </CardContent>
        </Card>
    );
}

/**
 * Full dashboard skeleton for initial load
 */
export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-10" />
                </div>
            </div>

            {/* KPI Cards skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <ReportCardSkeleton key={i} />
                ))}
            </div>

            {/* Revenue chart skeleton */}
            <ChartSkeleton type="line" height={300} />

            {/* Grid charts skeleton */}
            <div className="grid gap-6 lg:grid-cols-2">
                <ChartSkeleton type="horizontal-bar" height={300} />
                <ChartSkeleton type="pie" height={300} />
            </div>

            {/* Orders chart skeleton */}
            <ChartSkeleton type="bar" height={300} />
        </div>
    );
}
