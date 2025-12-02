"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bill } from "../types";
import { useVoidBill } from "../hooks";
import { formatCurrency } from "../utils";
import { useTranslation } from "react-i18next";
import { Loader2, AlertTriangle } from "lucide-react";

interface VoidBillDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bill: Bill | null;
}

export function VoidBillDialog({
    open,
    onOpenChange,
    bill,
}: VoidBillDialogProps) {
    const { t } = useTranslation();
    const voidBillMutation = useVoidBill();

    const [reason, setReason] = useState("");

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setReason("");
        }
    }, [open]);

    if (!bill) return null;

    const isPaid = bill.paymentStatus === "paid";

    const handleSubmit = async () => {
        if (!bill || !reason.trim()) return;

        await voidBillMutation.mutateAsync({
            id: bill.billId,
            reason: reason.trim(),
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("billing.voidBill")}</DialogTitle>
                    <DialogDescription>
                        {t("billing.voidBillDescription")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Bill Info */}
                    <div className="rounded-lg border p-4 space-y-2">
                        <h4 className="font-medium">{bill.billNumber}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">
                                    {t("billing.table")}:{" "}
                                </span>
                                <span className="font-medium">
                                    {bill.table?.tableNumber || "-"}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    {t("billing.statusLabel")}:{" "}
                                </span>
                                <span className="font-medium">
                                    {t(`billing.status.${bill.paymentStatus}`)}
                                </span>
                            </div>
                        </div>
                        <div className="text-sm font-bold">
                            <span className="text-muted-foreground">
                                {t("billing.total")}:{" "}
                            </span>
                            <span>{formatCurrency(bill.totalAmount)}</span>
                        </div>
                    </div>

                    {/* Warning for paid bills */}
                    {isPaid && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                {t("billing.voidPaidBillWarning")}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Side effects warning */}
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <ul className="list-disc list-inside text-sm">
                                <li>{t("billing.voidEffects.deletePayments")}</li>
                                <li>{t("billing.voidEffects.deleteBillItems")}</li>
                                {isPaid && (
                                    <>
                                        <li>{t("billing.voidEffects.revertOrderStatus")}</li>
                                        <li>{t("billing.voidEffects.revertTableStatus")}</li>
                                    </>
                                )}
                            </ul>
                        </AlertDescription>
                    </Alert>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label>
                            {t("billing.voidReason")}{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={t("billing.voidReasonPlaceholder")}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={voidBillMutation.isPending}
                    >
                        {t("common.cancel")}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={!reason.trim() || voidBillMutation.isPending}
                    >
                        {voidBillMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("common.processing")}
                            </>
                        ) : (
                            t("billing.confirmVoid")
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
