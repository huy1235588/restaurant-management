"use client";

import { PaymentMethod } from "../types";
import { PAYMENT_METHODS } from "../constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Banknote, CreditCard, Wallet, ArrowLeftRight } from "lucide-react";

interface PaymentMethodSelectorProps {
    selected: PaymentMethod | null;
    onSelect: (method: PaymentMethod) => void;
    disabled?: boolean;
}

const iconMap = {
    Banknote,
    CreditCard,
    Wallet,
    ArrowLeftRight,
};

export function PaymentMethodSelector({
    selected,
    onSelect,
    disabled = false,
}: PaymentMethodSelectorProps) {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((method) => {
                const Icon = iconMap[method.icon as keyof typeof iconMap];
                const isSelected = selected === method.value;

                return (
                    <Button
                        key={method.value}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                            "h-20 flex-col gap-2",
                            isSelected && "ring-2 ring-primary"
                        )}
                        onClick={() => onSelect(method.value)}
                        disabled={disabled}
                    >
                        <Icon className="h-6 w-6" />
                        <span className="text-sm">{t(method.labelKey)}</span>
                    </Button>
                );
            })}
        </div>
    );
}
