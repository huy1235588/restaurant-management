import { Badge } from "@/components/ui/badge";
import { KitchenPriority } from "../types/kitchen.types";
import { PRIORITY_COLORS } from "../constants/kitchen.constants";

interface PriorityBadgeProps {
    priority: KitchenPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
    const colors = PRIORITY_COLORS[priority];

    const priorityLabel: Record<KitchenPriority, string> = {
        urgent: "🔥 Urgent",
        high: "High",
        normal: "Normal",
        low: "Low",
    };

    return (
        <Badge
            className={`${colors.bg} ${colors.text} ${colors.border} border font-semibold`}
        >
            {priorityLabel[priority]}
        </Badge>
    );
}
