"use client";

import { Bill } from "../types";
import { formatCurrency } from "../utils";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface BillSummaryProps {
    bill: Bill;
    showDetails?: boolean;
    showActions?: boolean;
}

export function BillSummary({ bill, showDetails = true, showActions = true }: BillSummaryProps) {
    const { t } = useTranslation();

    const content = (
        <div className="space-y-2 text-sm">
            {showDetails && (
                <>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            {t("billing.subtotal", "Tạm tính")}
                        </span>
                        <span>{formatCurrency(bill.subtotal)}</span>
                    </div>
                    {bill.taxAmount > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                {t("billing.tax", "Thuế")} ({(bill.taxRate * 100).toFixed(0)}%)
                            </span>
                            <span>{formatCurrency(bill.taxAmount)}</span>
                        </div>
                    )}
                    {bill.serviceCharge > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                {t("billing.serviceCharge", "Phí dịch vụ")}
                            </span>
                            <span>{formatCurrency(bill.serviceCharge)}</span>
                        </div>
                    )}
                    {bill.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>{t("billing.discount", "Giảm giá")}</span>
                            <span>-{formatCurrency(bill.discountAmount)}</span>
                        </div>
                    )}
                    <Separator />
                </>
            )}
            <div className="flex justify-between font-bold text-lg">
                <span>{t("billing.total", "Tổng cộng")}</span>
                <span>{formatCurrency(bill.totalAmount)}</span>
            </div>
            {bill.paymentStatus === "paid" && (
                <>
                    <div className="flex justify-between text-muted-foreground">
                        <span>{t("billing.paidAmount", "Đã thanh toán")}</span>
                        <span>{formatCurrency(bill.paidAmount)}</span>
                    </div>
                    {bill.changeAmount > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                            <span>{t("billing.change", "Tiền thối")}</span>
                            <span>{formatCurrency(bill.changeAmount)}</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    // If used in a view (with Card wrapper)
    if (showActions !== undefined) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t("billing.summary", "Tổng kết")}</CardTitle>
                </CardHeader>
                <CardContent>
                    {content}
                </CardContent>
            </Card>
        );
    }

    return content;
}
