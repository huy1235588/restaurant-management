"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { KitchenHelpers } from "../utils/kitchen-helpers";
import { KitchenOrderStatus } from "../types/kitchen.types";

interface PrepTimeIndicatorProps {
    createdAt: string;
    status: KitchenOrderStatus;
    completedAt?: string;
}

export function PrepTimeIndicator({ createdAt, status, completedAt }: PrepTimeIndicatorProps) {
    // Calculate initial elapsed time
    const isTerminal = status === KitchenOrderStatus.COMPLETED;
    const finalTime = completedAt || createdAt;
    
    const [elapsedSeconds, setElapsedSeconds] = useState(
        isTerminal 
            ? KitchenHelpers.calculateElapsedTime(createdAt, finalTime)
            : KitchenHelpers.calculateElapsedTime(createdAt)
    );

    // Update every second only if not in terminal status
    useEffect(() => {
        if (isTerminal) {
            // For completed orders, calculate final time once
            const finalElapsed = KitchenHelpers.calculateElapsedTime(createdAt, finalTime);
            setElapsedSeconds(finalElapsed);
            return; // No timer needed
        }

        // For active orders, update every second
        const timer = setInterval(() => {
            setElapsedSeconds(KitchenHelpers.calculateElapsedTime(createdAt));
        }, 1000);

        return () => clearInterval(timer);
    }, [createdAt, isTerminal, finalTime]);

    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const formattedTime = KitchenHelpers.formatElapsedTime(elapsedSeconds);
    
    // Use muted color for terminal status
    const colorClass = isTerminal 
        ? "text-gray-400 dark:text-gray-500"
        : KitchenHelpers.getPrepTimeColor(elapsedMinutes);

    return (
        <div className="flex items-center gap-2">
            {status === KitchenOrderStatus.COMPLETED && (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            )}
            {!isTerminal && (
                <Clock className={`h-4 w-4 ${colorClass}`} />
            )}
            <span className={`font-mono text-lg font-semibold ${colorClass}`}>
                {formattedTime}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
                {isTerminal ? "completed in" : "elapsed"}
            </span>
        </div>
    );
}
