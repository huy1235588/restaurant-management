import { Clock, ChefHat, CheckCircle2, Timer } from "lucide-react";
import { KitchenOrder, KitchenOrderStatus } from "../types/kitchen.types";
import { KitchenHelpers } from "../utils/kitchen-helpers";
import { useTranslation } from "react-i18next";

interface KitchenStatsProps {
    orders?: KitchenOrder[];
}

export function KitchenStats({ orders }: KitchenStatsProps) {
    const { t } = useTranslation();

    if (!orders) return null;

    const pendingCount = orders.filter(
        (o) => o.status === KitchenOrderStatus.PENDING
    ).length;

    const inProgressCount = KitchenHelpers.getInProgressCount(orders);

    const readyCount = orders.filter(
        (o) => o.status === KitchenOrderStatus.PREPARING
    ).length;

    const avgPrepTime = KitchenHelpers.calculateAvgPrepTime(orders);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {/* Pending */}
            <div className="bg-gray-100 dark:bg-gray-800 p-2 md:p-3 rounded-lg">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{t('kitchen.stats.pending')}</p>
                        <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                            {pendingCount}
                        </p>
                    </div>
                </div>
            </div>

            {/* In Progress */}
            <div className="bg-blue-100 dark:bg-blue-950/20 p-2 md:p-3 rounded-lg">
                <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                        <p className="text-xs text-blue-600 dark:text-blue-400">{t('kitchen.stats.inProgress')}</p>
                        <p className="text-lg md:text-2xl font-bold text-blue-900 dark:text-blue-100">
                            {inProgressCount}
                        </p>
                    </div>
                </div>
            </div>

            {/* Ready */}
            <div className="bg-green-100 dark:bg-green-950/20 p-2 md:p-3 rounded-lg">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
                    <div>
                        <p className="text-xs text-green-600 dark:text-green-400">{t('kitchen.stats.ready')}</p>
                        <p className="text-lg md:text-2xl font-bold text-green-900 dark:text-green-100">
                            {readyCount}
                        </p>
                    </div>
                </div>
            </div>

            {/* Avg Prep Time */}
            <div className="bg-orange-100 dark:bg-orange-950/20 p-2 md:p-3 rounded-lg">
                <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 md:h-5 md:w-5 text-orange-600 dark:text-orange-400" />
                    <div>
                        <p className="text-xs text-orange-600 dark:text-orange-400">{t('kitchen.stats.avgTime')}</p>
                        <p className="text-lg md:text-2xl font-bold text-orange-900 dark:text-orange-100">
                            {avgPrepTime}m
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
