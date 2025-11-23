import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="border rounded-lg p-4 space-y-3 bg-white dark:bg-gray-800"
                >
                    <div className="flex justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-12 w-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
        </div>
    );
}
