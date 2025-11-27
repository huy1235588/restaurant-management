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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bill } from "../types";
import { useApplyDiscount } from "../hooks";
import {
    formatCurrency,
    isValidDiscountAmount,
    isValidDiscountPercentage,
    calculateDiscountFromPercentage,
} from "../utils";
import { useTranslation } from "react-i18next";
import { Loader2, AlertTriangle } from "lucide-react";

interface ApplyDiscountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bill: Bill | null;
}

type DiscountType = "percentage" | "amount";

export function ApplyDiscountDialog({
    open,
    onOpenChange,
    bill,
}: ApplyDiscountDialogProps) {
    const { t } = useTranslation();
    const applyDiscountMutation = useApplyDiscount();

    const [discountType, setDiscountType] = useState<DiscountType>("percentage");
    const [percentage, setPercentage] = useState("");
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setDiscountType("percentage");
            setPercentage("");
            setAmount("");
            setReason("");
        }
    }, [open]);

    if (!bill) return null;

    const subtotal = bill.subtotal;
    const percentageNum = parseFloat(percentage) || 0;
    const amountNum = parseFloat(amount) || 0;

    const calculatedDiscount =
        discountType === "percentage"
            ? calculateDiscountFromPercentage(subtotal, percentageNum)
            : amountNum;

    const newTotal =
        subtotal +
        bill.taxAmount +
        bill.serviceCharge -
        calculatedDiscount;

    const isValidDiscount =
        discountType === "percentage"
            ? isValidDiscountPercentage(percentageNum)
            : isValidDiscountAmount(amountNum, subtotal);

    const requiresApproval = percentageNum > 10 || (amountNum / subtotal) * 100 > 10;

    const canSubmit =
        isValidDiscount &&
        reason.trim().length > 0 &&
        (discountType === "percentage" ? percentageNum > 0 : amountNum > 0);

    const handleSubmit = async () => {
        if (!bill || !canSubmit) return;

        await applyDiscountMutation.mutateAsync({
            id: bill.billId,
            data:
                discountType === "percentage"
                    ? { percentage: percentageNum, reason: reason.trim() }
                    : { amount: amountNum, reason: reason.trim() },
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("billing.applyDiscount")}</DialogTitle>
                    <DialogDescription>
                        {t("billing.applyDiscountDescription")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Bill Info */}
                    <div className="rounded-lg border p-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                {t("billing.bill")}:
                            </span>
                            <span className="font-medium">{bill.billNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                {t("billing.subtotal")}:
                            </span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                    </div>

                    {/* Discount Type */}
                    <div className="space-y-2">
                        <Label>{t("billing.discountType")}</Label>
                        <RadioGroup
                            value={discountType}
                            onValueChange={(v) => setDiscountType(v as DiscountType)}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="percentage" id="percentage" />
                                <Label htmlFor="percentage" className="font-normal">
                                    {t("billing.percentage")}
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="amount" id="amount" />
                                <Label htmlFor="amount" className="font-normal">
                                    {t("billing.fixedAmount")}
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Discount Value */}
                    <div className="space-y-2">
                        <Label>
                            {discountType === "percentage"
                                ? t("billing.discountPercentage")
                                : t("billing.discountAmount")}
                        </Label>
                        {discountType === "percentage" ? (
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={percentage}
                                    onChange={(e) => setPercentage(e.target.value)}
                                    placeholder="0"
                                    className="pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    %
                                </span>
                            </div>
                        ) : (
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="0"
                                    max={subtotal}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0"
                                    className="pr-12"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    ₫
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label>
                            {t("billing.discountReason")} <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={t("billing.discountReasonPlaceholder")}
                            rows={2}
                        />
                    </div>

                    {/* Warning for large discount */}
                    {requiresApproval && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                {t("billing.largeDiscountWarning")}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Preview */}
                    {calculatedDiscount > 0 && (
                        <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
                            <div className="flex justify-between text-green-600">
                                <span>{t("billing.discount")}:</span>
                                <span>-{formatCurrency(calculatedDiscount)}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span>{t("billing.newTotal")}:</span>
                                <span>{formatCurrency(newTotal)}</span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={applyDiscountMutation.isPending}
                    >
                        {t("common.cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit || applyDiscountMutation.isPending}
                    >
                        {applyDiscountMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("common.processing")}
                            </>
                        ) : (
                            t("billing.applyDiscount")
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
