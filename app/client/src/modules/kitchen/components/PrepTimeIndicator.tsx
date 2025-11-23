"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { KitchenHelpers } from "../utils/kitchen-helpers";

interface PrepTimeIndicatorProps {
    createdAt: string;
}

export function PrepTimeIndicator({ createdAt }: PrepTimeIndicatorProps) {
    const [elapsedSeconds, setElapsedSeconds] = useState(
        KitchenHelpers.calculateElapsedTime(createdAt)
    );

    // Update every second
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedSeconds(KitchenHelpers.calculateElapsedTime(createdAt));
        }, 1000);

        return () => clearInterval(timer);
    }, [createdAt]);

    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const formattedTime = KitchenHelpers.formatElapsedTime(elapsedSeconds);
    const colorClass = KitchenHelpers.getPrepTimeColor(elapsedMinutes);

    return (
        <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${colorClass}`} />
            <span className={`font-mono text-lg font-semibold ${colorClass}`}>
                {formattedTime}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
                elapsed
            </span>
        </div>
    );
}
