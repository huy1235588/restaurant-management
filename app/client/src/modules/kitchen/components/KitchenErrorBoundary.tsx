"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function KitchenErrorBoundary({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary
            fallback={
                <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Kitchen Display Error
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Unable to load kitchen display. Please try refreshing the page.
                        </p>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="default"
                        >
                            Reload Page
                        </Button>
                    </div>
                </div>
            }
            onError={(error, errorInfo) => {
                console.error("[KitchenErrorBoundary]", error, errorInfo);
                // Could send to error tracking service here
            }}
        >
            {children}
        </ErrorBoundary>
    );
}
