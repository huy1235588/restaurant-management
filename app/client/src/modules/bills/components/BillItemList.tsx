"use client";

import { BillItem } from "../types";
import { formatCurrency } from "../utils";
import { useTranslation } from "react-i18next";

interface BillItemListProps {
    items: BillItem[];
}

export function BillItemList({ items }: BillItemListProps) {
    const { t } = useTranslation();

    if (!items || items.length === 0) {
        return (
            <div className="text-center py-4 text-muted-foreground">
                {t("billing.noItems")}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                <div className="col-span-5">{t("billing.itemName")}</div>
                <div className="col-span-2 text-center">{t("billing.quantity")}</div>
                <div className="col-span-2 text-right">{t("billing.unitPrice")}</div>
                <div className="col-span-3 text-right">{t("billing.total")}</div>
            </div>
            {items.map((item) => (
                <div
                    key={item.billItemId}
                    className="grid grid-cols-12 gap-2 text-sm py-2 border-b border-dashed last:border-0"
                >
                    <div className="col-span-5 font-medium">
                        {item.itemName}
                    </div>
                    <div className="col-span-2 text-center">
                        x{item.quantity}
                    </div>
                    <div className="col-span-2 text-right text-muted-foreground">
                        {formatCurrency(item.unitPrice)}
                    </div>
                    <div className="col-span-3 text-right font-medium">
                        {formatCurrency(item.total)}
                    </div>
                </div>
            ))}
        </div>
    );
}
