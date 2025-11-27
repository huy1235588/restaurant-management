"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateBill } from "../hooks";
import { formatCurrency } from "../utils";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

interface CreateBillDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: {
        orderId: number;
        orderNumber: string;
        tableNumber: string;
        totalAmount: string;
        itemCount: number;
    } | null;
}

export function CreateBillDialog({
    open,
    onOpenChange,
    order,
}: CreateBillDialogProps) {
    const { t } = useTranslation();
    const createBillMutation = useCreateBill();

    const handleSubmit = async () => {
        if (!order) return;

        await createBillMutation.mutateAsync({
            orderId: order.orderId,
        });

        onOpenChange(false);
    };

    if (!order) return null;

    // Estimate tax and service (10% tax, 5% service)
    const subtotal = parseFloat(order.totalAmount);
    const taxAmount = subtotal * 0.1;
    const serviceCharge = subtotal * 0.05;
    const totalAmount = subtotal + taxAmount + serviceCharge;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("billing.createBill")}</DialogTitle>
                    <DialogDescription>
                        {t("billing.createBillDescription")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border p-4 space-y-2">
                        <h4 className="font-medium">{order.orderNumber}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">
                                    {t("billing.table")}:{" "}
                                </span>
                                <span className="font-medium">
                                    {order.tableNumber}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    {t("billing.items")}:{" "}
                                </span>
                                <span className="font-medium">
                                    {order.itemCount} {t("billing.itemUnit")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                {t("billing.subtotal")}
                            </span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                {t("billing.tax")} (10%)
                            </span>
                            <span>{formatCurrency(taxAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                {t("billing.serviceCharge")} (5%)
                            </span>
                            <span>{formatCurrency(serviceCharge)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base border-t pt-2">
                            <span>{t("billing.estimatedTotal")}</span>
                            <span>{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={createBillMutation.isPending}
                    >
                        {t("common.cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={createBillMutation.isPending}
                    >
                        {createBillMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("common.processing")}
                            </>
                        ) : (
                            t("billing.confirmCreateBill")
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
