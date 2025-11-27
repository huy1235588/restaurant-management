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
import { Bill, PaymentMethod } from "../types";
import { useProcessPayment } from "../hooks";
import { PaymentMethodSelector } from "../components/PaymentMethodSelector";
import { formatCurrency, calculateChange } from "../utils";
import { useTranslation } from "react-i18next";
import { Loader2, CheckCircle } from "lucide-react";

interface ProcessPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bill: Bill | null;
}

type Step = "method" | "details" | "success";

export function ProcessPaymentDialog({
    open,
    onOpenChange,
    bill,
}: ProcessPaymentDialogProps) {
    const { t } = useTranslation();
    const processPaymentMutation = useProcessPayment();

    const [step, setStep] = useState<Step>("method");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [receivedAmount, setReceivedAmount] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cardHolderName, setCardHolderName] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [notes, setNotes] = useState("");
    const [changeAmount, setChangeAmount] = useState(0);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setStep("method");
            setPaymentMethod(null);
            setReceivedAmount("");
            setCardNumber("");
            setCardHolderName("");
            setTransactionId("");
            setNotes("");
            setChangeAmount(0);
        }
    }, [open]);

    if (!bill) return null;

    const totalAmount = bill.totalAmount;
    const receivedNum = parseFloat(receivedAmount) || 0;

    const handleMethodSelect = (method: PaymentMethod) => {
        setPaymentMethod(method);
        if (method !== "cash") {
            // For non-cash, auto-set received amount to total
            setReceivedAmount(totalAmount.toString());
        }
        setStep("details");
    };

    const handleBack = () => {
        setStep("method");
        setPaymentMethod(null);
    };

    const canSubmit =
        paymentMethod !== null &&
        (paymentMethod === "cash"
            ? receivedNum >= totalAmount
            : receivedNum === totalAmount);

    const handleSubmit = async () => {
        if (!bill || !paymentMethod || !canSubmit) return;

        const change = calculateChange(receivedNum, totalAmount);
        setChangeAmount(change);

        await processPaymentMutation.mutateAsync({
            id: bill.billId,
            data: {
                amount: totalAmount,
                paymentMethod,
                cardNumber: cardNumber || undefined,
                cardHolderName: cardHolderName || undefined,
                transactionId: transactionId || undefined,
                notes: notes || undefined,
            },
        });

        setStep("success");
    };

    const handleClose = () => {
        onOpenChange(false);
    };

    // Step 1: Select payment method
    if (step === "method") {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("billing.processPayment")}</DialogTitle>
                        <DialogDescription>
                            {t("billing.selectPaymentMethod")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="rounded-lg border p-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                {t("billing.amountToPay")}
                            </p>
                            <p className="text-3xl font-bold">
                                {formatCurrency(totalAmount)}
                            </p>
                        </div>

                        <PaymentMethodSelector
                            selected={paymentMethod}
                            onSelect={handleMethodSelect}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose}>
                            {t("common.cancel")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    // Step 2: Enter payment details
    if (step === "details") {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("billing.paymentDetails")}</DialogTitle>
                        <DialogDescription>
                            {paymentMethod === "cash"
                                ? t("billing.enterReceivedAmount")
                                : t("billing.enterPaymentDetails")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="rounded-lg border p-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {t("billing.bill")}:
                                </span>
                                <span className="font-medium">{bill.billNumber}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span>{t("billing.total")}:</span>
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>

                        {paymentMethod === "cash" && (
                            <div className="space-y-2">
                                <Label>{t("billing.receivedAmount")}</Label>
                                <Input
                                    type="number"
                                    value={receivedAmount}
                                    onChange={(e) => setReceivedAmount(e.target.value)}
                                    placeholder={totalAmount.toString()}
                                    min={totalAmount}
                                />
                                {receivedNum >= totalAmount && (
                                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            {t("billing.change")}
                                        </p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(
                                                calculateChange(receivedNum, totalAmount)
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {paymentMethod === "card" && (
                            <>
                                <div className="space-y-2">
                                    <Label>{t("billing.cardNumber")}</Label>
                                    <Input
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        placeholder="**** **** **** 1234"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("billing.cardHolderName")}</Label>
                                    <Input
                                        value={cardHolderName}
                                        onChange={(e) => setCardHolderName(e.target.value)}
                                        placeholder="NGUYEN VAN A"
                                    />
                                </div>
                            </>
                        )}

                        {(paymentMethod === "e-wallet" ||
                            paymentMethod === "transfer") && (
                            <div className="space-y-2">
                                <Label>{t("billing.transactionId")}</Label>
                                <Input
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder={t("billing.transactionIdPlaceholder")}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>{t("billing.notes")}</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={t("billing.notesPlaceholder")}
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={processPaymentMutation.isPending}
                        >
                            {t("common.back")}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!canSubmit || processPaymentMutation.isPending}
                        >
                            {processPaymentMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("common.processing")}
                                </>
                            ) : (
                                t("billing.confirmPayment")
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    // Step 3: Success
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <div className="text-center py-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                        {t("billing.paymentSuccess")}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        {t("billing.paymentSuccessDescription")}
                    </p>

                    {paymentMethod === "cash" && changeAmount > 0 && (
                        <div className="rounded-lg bg-muted p-4 mb-4">
                            <p className="text-sm text-muted-foreground">
                                {t("billing.changeToReturn")}
                            </p>
                            <p className="text-3xl font-bold text-green-600">
                                {formatCurrency(changeAmount)}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={handleClose} className="w-full">
                        {t("common.close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
