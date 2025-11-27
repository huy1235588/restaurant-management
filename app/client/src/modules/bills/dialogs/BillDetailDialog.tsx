"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bill } from "../types";
import { BillStatusBadge } from "../components/BillStatusBadge";
import { BillItemList } from "../components/BillItemList";
import { BillSummary } from "../components/BillSummary";
import { formatDateTime, getPaymentMethodLabel } from "../utils";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

interface BillDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bill: Bill | null;
}

export function BillDetailDialog({
    open,
    onOpenChange,
    bill,
}: BillDetailDialogProps) {
    const { t } = useTranslation();
    const router = useRouter();

    if (!bill) return null;

    const handleViewFullDetail = () => {
        onOpenChange(false);
        router.push(`/bills/${bill.billId}`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>{bill.billNumber}</DialogTitle>
                        <BillStatusBadge status={bill.paymentStatus} />
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Bill Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">{t("billing.table")}</p>
                            <p className="font-medium">
                                {bill.table?.tableNumber || "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">{t("billing.order")}</p>
                            <p className="font-medium">
                                {bill.order?.orderNumber || "-"}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">{t("billing.createdAt")}</p>
                            <p className="font-medium">{formatDateTime(bill.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">{t("billing.staff")}</p>
                            <p className="font-medium">{bill.staff?.fullName || "-"}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Bill Items */}
                    <div>
                        <h4 className="font-medium mb-2">{t("billing.items")}</h4>
                        <BillItemList items={bill.billItems || []} />
                    </div>

                    <Separator />

                    {/* Bill Summary */}
                    <BillSummary bill={bill} />

                    {/* Payment Info (if paid) */}
                    {bill.paymentStatus === "paid" && bill.paidAt && (
                        <>
                            <Separator />
                            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-sm">
                                <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">
                                    {t("billing.paymentInfo")}
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-muted-foreground">
                                            {t("billing.paymentMethod")}
                                        </p>
                                        <p className="font-medium">
                                            {bill.paymentMethod
                                                ? t(getPaymentMethodLabel(bill.paymentMethod))
                                                : "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">
                                            {t("billing.paidAt")}
                                        </p>
                                        <p className="font-medium">
                                            {formatDateTime(bill.paidAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t("common.close")}
                    </Button>
                    <Button onClick={handleViewFullDetail}>
                        {t("billing.viewFullDetails")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
