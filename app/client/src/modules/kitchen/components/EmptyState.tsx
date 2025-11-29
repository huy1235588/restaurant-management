import { UtensilsCrossed } from "lucide-react";
import { useTranslation } from "react-i18next";

export function EmptyState() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500 dark:text-gray-400">
            <UtensilsCrossed className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-xl font-semibold mb-2">{t('kitchen.noOrdersInQueue')}</p>
            <p className="text-sm">{t('kitchen.ordersWillAppear')}</p>
        </div>
    );
}
