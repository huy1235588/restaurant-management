"use client";

import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bill } from "../types";
import { BillStatusBadge } from "../components/BillStatusBadge";
import { BillItemList } from "../components/BillItemList";
import { BillSummary } from "../components/BillSummary";
import { PrintableBill } from "../components/PrintableBill";
import { formatDateTime, getPaymentMethodLabel } from "../utils";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Printer, Eye } from "lucide-react";

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
    const printRef = useRef<HTMLDivElement>(null);
    const [showPrintPreview, setShowPrintPreview] = useState(false);

    if (!bill) return null;

    const handleViewFullDetail = () => {
        onOpenChange(false);
        router.push(`/admin/bills/${bill.billId}`);
    };

    const handlePrint = () => {
        setShowPrintPreview(true);
    };

    const handleConfirmPrint = () => {
        window.print();
    };

    // Print Preview Dialog
    if (showPrintPreview) {
        return (
            <>
                <Dialog open={open} onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setShowPrintPreview(false);
                    }
                    onOpenChange(isOpen);
                }}>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Printer className="h-5 w-5" />
                                {t('billing.printPreview', 'Xem trước hóa đơn')}
                            </DialogTitle>
                            <DialogDescription>
                                {t('billing.printPreviewDescription', 'Xem trước hóa đơn trước khi in')}
                            </DialogDescription>
                        </DialogHeader>

                        {/* Print Preview Content */}
                        <div className="border rounded-lg overflow-hidden bg-white">
                            <PrintableBill
                                ref={printRef}
                                bill={bill}
                            />
                        </div>

                        {/* Print Actions */}
                        <div className="flex gap-2 justify-end mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowPrintPreview(false)}
                            >
                                {t('common.back', 'Quay lại')}
                            </Button>
                            <Button onClick={handleConfirmPrint}>
                                <Printer className="mr-2 h-4 w-4" />
                                {t('common.print', 'In')}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Hidden Printable Bill for actual printing */}
                <div className="hidden print:block">
                    <PrintableBill ref={printRef} bill={bill} />
                </div>
            </>
        );
    }

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
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        {t("common.print", "In")}
                    </Button>
                    <Button onClick={handleViewFullDetail}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t("billing.viewFullDetails")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
