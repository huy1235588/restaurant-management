"use client";

import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "../types";
import { PAYMENT_STATUS_CONFIG } from "../constants";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface BillStatusBadgeProps {
    status: PaymentStatus;
    className?: string;
}

export function BillStatusBadge({ status, className }: BillStatusBadgeProps) {
    const { t } = useTranslation();
    const config = PAYMENT_STATUS_CONFIG[status];

    return (
        <Badge
            variant={config.variant}
            className={cn(config.color, className)}
        >
            {t(config.labelKey)}
        </Badge>
    );
}
