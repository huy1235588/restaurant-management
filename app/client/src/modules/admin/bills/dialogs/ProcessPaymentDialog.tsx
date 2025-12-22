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
import { Loader2, CheckCircle, Copy, Check, AlertCircle, ArrowLeft, Receipt } from "lucide-react";
import { useSettings } from "@/modules/admin/settings/hooks";
import { BankConfig } from "@/modules/admin/settings/types";
import { cn } from "@/lib/utils";

interface ProcessPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bill: Bill | null;
}

type Step = "method" | "details" | "success";

const DEFAULT_BANK_CONFIG: BankConfig = {
    bankId: "970422",
    bankName: "MB Bank",
    accountNo: "0123456789",
    accountName: "NHA HANG ABC",
    template: "compact2",
};

function generateVietQRUrl(config: BankConfig, amount: number, description: string): string {
    const { bankId, accountNo, template, accountName } = config;
    const encodedDesc = encodeURIComponent(description);
    const encodedName = encodeURIComponent(accountName || '');
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template || 'compact2'}.png?amount=${amount}&addInfo=${encodedDesc}&accountName=${encodedName}`;
}

export function ProcessPaymentDialog({
    open,
    onOpenChange,
    bill,
}: ProcessPaymentDialogProps) {
    const { t } = useTranslation();
    const processPaymentMutation = useProcessPayment();
    const { settings } = useSettings();

    const bankConfig: BankConfig = settings?.bankConfig || DEFAULT_BANK_CONFIG;

    const [step, setStep] = useState<Step>("method");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [receivedAmount, setReceivedAmount] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [notes, setNotes] = useState("");
    const [changeAmount, setChangeAmount] = useState(0);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (open) {
            setStep("method");
            setPaymentMethod(null);
            setReceivedAmount("");
            setTransactionId("");
            setNotes("");
            setChangeAmount(0);
            setCopied(false);
        }
    }, [open]);

    if (!bill) return null;

    const totalAmount = bill.totalAmount;
    const receivedNum = parseFloat(receivedAmount) || 0;

    const handleMethodSelect = (method: PaymentMethod) => {
        setPaymentMethod(method);
        if (method !== "cash") {
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
            : true);

    const handleCopyAccountNo = async () => {
        try {
            await navigator.clipboard.writeText(bankConfig.accountNo || '');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleSubmit = async () => {
        if (!bill || !paymentMethod || !canSubmit) return;

        const change = paymentMethod === "cash" ? calculateChange(receivedNum, totalAmount) : 0;
        setChangeAmount(change);

        await processPaymentMutation.mutateAsync({
            id: bill.billId,
            data: {
                amount: totalAmount,
                paymentMethod,
                transactionId: transactionId || undefined,
                notes: notes || undefined,
            },
        });

        setStep("success");
    };

    const handleClose = () => {
        onOpenChange(false);
    };

    // Quick amount buttons for cash payment
    const quickAmounts = [
        Math.ceil(totalAmount / 10000) * 10000, // Round up to nearest 10k
        Math.ceil(totalAmount / 50000) * 50000, // Round up to nearest 50k
        Math.ceil(totalAmount / 100000) * 100000, // Round up to nearest 100k
    ].filter((amount, index, arr) => amount > totalAmount && arr.indexOf(amount) === index);

    // Step 1: Select payment method
    if (step === "method") {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            {t("billing.processPayment")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("billing.selectPaymentMethod")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Bill Summary */}
                        <div className="rounded-xl border-2 border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 p-6 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    {t("billing.bill")}:
                                </span>
                                <span className="text-sm font-bold">{bill.billNumber}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                                {t("billing.amountToPay")}
                            </p>
                            <p className="text-4xl font-bold text-primary">
                                {formatCurrency(totalAmount)}
                            </p>
                        </div>

                        <PaymentMethodSelector
                            selected={paymentMethod}
                            onSelect={handleMethodSelect}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
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
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            {t("billing.paymentDetails")}
                        </DialogTitle>
                        <DialogDescription>
                            {paymentMethod === "cash"
                                ? t("billing.enterReceivedAmount")
                                : t("billing.enterPaymentDetails")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5">
                        {/* Compact Bill Summary */}
                        <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">
                                    {t("billing.bill")}:
                                </span>
                                <span className="font-semibold">{bill.billNumber}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{t("billing.total")}:</span>
                                <span className="text-xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>

                        {paymentMethod === "cash" && (
                            <div className="space-y-3">
                                <Label className="text-base font-semibold">{t("billing.receivedAmount")}</Label>
                                <Input
                                    type="number"
                                    value={receivedAmount}
                                    onChange={(e) => setReceivedAmount(e.target.value)}
                                    placeholder={totalAmount.toString()}
                                    min={totalAmount}
                                    className="text-lg h-12"
                                    autoFocus
                                />

                                {/* Quick Amount Buttons */}
                                {quickAmounts.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">
                                            {t("billing.quickAmounts", "Số tiền nhanh")}:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {quickAmounts.map((amount) => (
                                                <Button
                                                    key={amount}
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setReceivedAmount(amount.toString())}
                                                    className={cn(
                                                        "transition-all",
                                                        receivedNum === amount && "border-primary bg-primary/10"
                                                    )}
                                                >
                                                    {formatCurrency(amount)}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {receivedNum >= totalAmount && (
                                    <div className="rounded-xl bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 text-center border-2 border-green-200 dark:border-green-800">
                                        <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                                            {t("billing.change")}
                                        </p>
                                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                            {formatCurrency(
                                                calculateChange(receivedNum, totalAmount)
                                            )}
                                        </p>
                                    </div>
                                )}

                                {receivedNum > 0 && receivedNum < totalAmount && (
                                    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-center border border-red-200 dark:border-red-800">
                                        <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                            {t("billing.insufficientAmount", "Số tiền không đủ")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {paymentMethod === "bank_transfer" && (
                            <div className="space-y-4">
                                {!settings?.bankConfig && (
                                    <div className="rounded-lg border-2 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/20 p-3 flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                                        <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                            {t("billing.bankNotConfigured", "Chưa cấu hình thông tin ngân hàng. Vui lòng cập nhật trong Cài đặt > Thanh toán.")}
                                        </div>
                                    </div>
                                )}

                                {/* QR Code Section */}
                                <div className="flex flex-col items-center gap-3 p-4 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                                    <div className="rounded-xl border-4 border-white shadow-lg p-3 bg-white">
                                        <img
                                            src={generateVietQRUrl(bankConfig, totalAmount, `TT ${bill.billNumber}`)}
                                            alt="QR Code thanh toán"
                                            className="w-52 h-52 object-contain"
                                        />
                                    </div>
                                    <p className="text-sm font-medium text-center text-blue-700 dark:text-blue-300">
                                        {t("billing.scanQrToPay", "Quét mã QR để thanh toán")}
                                    </p>
                                </div>

                                {/* Bank Account Info */}
                                <div className="rounded-xl border bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            {t("billing.bankName", "Ngân hàng")}
                                        </span>
                                        <span className="font-semibold">{bankConfig.bankName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            {t("billing.bankAccount", "Số tài khoản")}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-semibold text-base">
                                                {bankConfig.accountNo}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={handleCopyAccountNo}
                                            >
                                                {copied ? (
                                                    <Check className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">
                                            {t("billing.accountHolder", "Chủ tài khoản")}
                                        </span>
                                        <span className="font-medium">{bankConfig.accountName}</span>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-muted-foreground">
                                                {t("billing.transferAmount", "Số tiền")}
                                            </span>
                                            <span className="font-bold text-lg text-primary">
                                                {formatCurrency(totalAmount)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">
                                                {t("billing.transferContent", "Nội dung CK")}
                                            </span>
                                            <span className="font-mono text-sm font-semibold">TT {bill.billNumber}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Optional Transaction ID */}
                                <div className="space-y-2">
                                    <Label className="text-sm">
                                        {t("billing.transactionId")}
                                        <span className="text-muted-foreground ml-1">
                                            ({t("common.optional", "Tùy chọn")})
                                        </span>
                                    </Label>
                                    <Input
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        placeholder={t("billing.transactionIdPlaceholder")}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label className="text-sm">{t("billing.notes")}</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={t("billing.notesPlaceholder")}
                                rows={2}
                                className="resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={processPaymentMutation.isPending}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t("common.back")}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!canSubmit || processPaymentMutation.isPending}
                            className="gap-2"
                        >
                            {processPaymentMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t("common.processing")}
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    {t("billing.confirmPayment")}
                                </>
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
            <DialogContent className="sm:max-w-xl">
                <div className="text-center py-8">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-4 border-green-200 dark:border-green-800">
                        <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">
                        {t("billing.paymentSuccess")}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        {t("billing.paymentSuccessDescription")}
                    </p>

                    {paymentMethod === "cash" && changeAmount > 0 && (
                        <div className="rounded-xl bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 mb-6 border-2 border-green-200 dark:border-green-800">
                            <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                                {t("billing.changeToReturn")}
                            </p>
                            <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(changeAmount)}
                            </p>
                        </div>
                    )}

                    {/* Summary */}
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("billing.bill")}:</span>
                            <span className="font-semibold">{bill.billNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("billing.paymentMethod")}:</span>
                            <span className="font-semibold capitalize">{paymentMethod}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base pt-2 border-t">
                            <span>{t("billing.total")}:</span>
                            <span className="text-primary">{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleClose} className="w-full" size="lg">
                        {t("common.close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}