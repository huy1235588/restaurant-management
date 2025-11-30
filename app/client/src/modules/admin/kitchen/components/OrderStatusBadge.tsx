import { Badge } from "@/components/ui/badge";
import { KitchenOrderStatus } from "../types/kitchen.types";
import { STATUS_COLORS } from "../constants/kitchen.constants";
import { useTranslation } from "react-i18next";

interface OrderStatusBadgeProps {
    status: KitchenOrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    const { t } = useTranslation();
    const colors = STATUS_COLORS[status];

    const statusKey: Record<KitchenOrderStatus, string> = {
        [KitchenOrderStatus.PENDING]: "kitchen.status.pending",
        [KitchenOrderStatus.PREPARING]: "kitchen.status.preparing",
        [KitchenOrderStatus.READY]: "kitchen.status.ready",
        [KitchenOrderStatus.COMPLETED]: "kitchen.status.completed",
    };

    return (
        <Badge
            className={`${colors.bg} ${colors.text} ${colors.border} border font-semibold`}
        >
            {t(statusKey[status])}
        </Badge>
    );
}
