"use client";

import { memo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bill } from "../types";
import { BillStatusBadge } from "./BillStatusBadge";
import { formatCurrency, formatDateTime } from "../utils";
import { Eye, CreditCard, Percent, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { formatOrderNumber } from "../../order";

export interface BillCardProps {
    bill: Bill;
    onClick?: () => void;
    onPayment?: (bill: Bill) => void;
    onApplyDiscount?: () => void;
    onProcessPayment?: () => void;
    onVoid?: () => void;
}

export const BillCard = memo(
    function BillCard({ bill, onClick, onPayment, onApplyDiscount, onProcessPayment, onVoid }: BillCardProps) {
        const router = useRouter();
        const { t } = useTranslation();

        const handleViewDetails = useCallback(() => {
            if (onClick) {
                onClick();
            } else {
                router.push(`/admin/bills/${bill.billId}`);
            }
        }, [router, bill.billId, onClick]);

        const handlePayment = useCallback(() => {
            if (onProcessPayment) {
                onProcessPayment();
            } else if (onPayment) {
                onPayment(bill);
            }
        }, [onPayment, onProcessPayment, bill]);

        const isPending = bill.paymentStatus === "pending";

        return (
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleViewDetails}>
                <CardHeader>
                    <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-3">
                            {bill.billNumber}
                            <BillStatusBadge status={bill.paymentStatus} />
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {bill.table && (
                                <span>
                                    {t("billing.table", "Bàn")}{" "}
                                    {bill.table.tableNumber}
                                </span>
                            )}
                            {bill.order && (
                                <span>• {formatOrderNumber(bill.order.orderNumber)}</span>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <p className="text-muted-foreground">
                                    {t("billing.subtotal", "Tạm tính")}
                                </p>
                                <p className="font-medium">
                                    {formatCurrency(bill.subtotal)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    {t("billing.discount", "Giảm giá")}
                                </p>
                                <p className="font-medium text-green-600">
                                    -{formatCurrency(bill.discountAmount)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-3">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {formatDateTime(bill.createdAt)}
                                </p>
                                {bill.staff && (
                                    <p className="text-xs text-muted-foreground">
                                        {bill.staff.fullName}
                                    </p>
                                )}
                            </div>
                            <p className="text-lg font-bold">
                                {formatCurrency(bill.totalAmount)}
                            </p>
                        </div>

                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleViewDetails}
                                className="flex-1"
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                {t("common.viewDetails", "Xem chi tiết")}
                            </Button>
                            {isPending && onApplyDiscount && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onApplyDiscount}
                                    title={t("billing.applyDiscount", "Giảm giá")}
                                >
                                    <Percent className="h-4 w-4" />
                                </Button>
                            )}
                            {isPending && (onProcessPayment || onPayment) && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handlePayment}
                                    title={t("billing.processPayment", "Thanh toán")}
                                >
                                    <CreditCard className="h-4 w-4" />
                                </Button>
                            )}
                            {onVoid && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={onVoid}
                                    title={t("billing.voidBill", "Hủy hóa đơn")}
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.bill.billId === nextProps.bill.billId &&
            prevProps.bill.paymentStatus === nextProps.bill.paymentStatus &&
            prevProps.bill.updatedAt === nextProps.bill.updatedAt &&
            prevProps.bill.totalAmount === nextProps.bill.totalAmount
        );
    }
);
