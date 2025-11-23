import { Badge } from "@/components/ui/badge";
import { KitchenOrderStatus } from "../types/kitchen.types";
import { STATUS_COLORS } from "../constants/kitchen.constants";

interface OrderStatusBadgeProps {
  status: KitchenOrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const colors = STATUS_COLORS[status];

  const statusLabel = {
    [KitchenOrderStatus.PENDING]: "Pending",
    [KitchenOrderStatus.READY]: "Ready",
    [KitchenOrderStatus.COMPLETED]: "Completed",
    [KitchenOrderStatus.CANCELLED]: "Cancelled",
  };

  return (
    <Badge
      className={`${colors.bg} ${colors.text} ${colors.border} border font-semibold`}
    >
      {statusLabel[status]}
    </Badge>
  );
}
