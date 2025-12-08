"use client";

import { forwardRef, useEffect, useState } from "react";
import { Bill } from "../types";
import { formatCurrency, formatDateTime } from "../utils";
import { useTranslation } from "react-i18next";
import { settingsApi } from "@/modules/admin/settings/services/settings.service";
import { RestaurantSettings } from "@/modules/admin/settings/types";
import { formatOrderNumber } from "../../order";

interface PrintableBillProps {
    bill: Bill;
    restaurantSettings?: RestaurantSettings | null;
    showLogo?: boolean;
}

export const PrintableBill = forwardRef<HTMLDivElement, PrintableBillProps>(
    function PrintableBill(
        {
            bill,
            restaurantSettings: providedSettings,
            showLogo = true,
        },
        ref
    ) {
        const [settings, setSettings] = useState<RestaurantSettings | null>(providedSettings || null);
        const [isLoading, setIsLoading] = useState(!providedSettings);

        useEffect(() => {
            if (!providedSettings) {
                const fetchSettings = async () => {
                    try {
                        const data = await settingsApi.getSettings();
                        setSettings(data);
                    } catch (error) {
                        console.error('Failed to fetch restaurant settings:', error);
                    } finally {
                        setIsLoading(false);
                    }
                };
                fetchSettings();
            }
        }, [providedSettings]);

        const restaurantName = settings?.name || "NHÀ HÀNG ABC";
        const restaurantAddress = settings?.address || "123 Đường ABC, Quận 1, TP.HCM";
        const restaurantPhone = settings?.phone || "0123 456 789";
        const { t } = useTranslation();

        const getPaymentMethodText = (method: string | null) => {
            if (!method) return "";
            const methods: Record<string, string> = {
                cash: "Tiền mặt",
                transfer: "Chuyển khoản",
            };
            return methods[method] || method;
        };

        return (
            <div
                ref={ref}
                className="print-bill bg-white text-black p-4 max-w-[80mm] mx-auto font-mono text-xs"
            >
                {/* Header */}
                <div className="text-center mb-4">
                    {showLogo && (
                        <div className="mb-2">
                            <div className="text-2xl font-bold">🍽️</div>
                        </div>
                    )}
                    <h1 className="text-lg font-bold uppercase tracking-wide">
                        {restaurantName}
                    </h1>
                    <p className="text-[10px] mt-1">{restaurantAddress}</p>
                    <p className="text-[10px]">ĐT: {restaurantPhone}</p>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-black my-2"></div>

                {/* Bill Info */}
                <div className="text-center mb-3">
                    <h2 className="text-base font-bold uppercase">
                        HÓA ĐƠN THANH TOÁN
                    </h2>
                    <p className="text-[10px] mt-1">
                        {t("billing.billNumber", "Số HĐ")}: {bill.billNumber}
                    </p>
                </div>

                {/* Order Details */}
                <div className="space-y-1 text-[11px] mb-3">
                    <div className="flex justify-between">
                        <span>{t("billing.table", "Bàn")}:</span>
                        <span className="font-bold">
                            {bill.table?.tableNumber || "N/A"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>{t("billing.staff", "Thu ngân")}:</span>
                        <span>{bill.staff?.fullName || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>{t("billing.date", "Ngày")}:</span>
                        <span>{formatDateTime(bill.createdAt)}</span>
                    </div>
                    {bill.order?.orderNumber && (
                        <div className="flex justify-between">
                            <span>{t("billing.orderNumber", "Đơn hàng")}:</span>
                            <span>{formatOrderNumber(bill.order.orderNumber)}</span>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-black my-2"></div>

                {/* Items Header */}
                <div className="flex text-[10px] font-bold mb-1 uppercase">
                    <div className="flex-1">{t("billing.itemName", "Món")}</div>
                    <div className="w-8 text-center">{t("billing.quantity", "SL")}</div>
                    <div className="w-16 text-right">{t("billing.unitPrice", "Đ.Giá")}</div>
                    <div className="w-20 text-right">{t("billing.total", "T.Tiền")}</div>
                </div>

                {/* Divider */}
                <div className="border-t border-black mb-1"></div>

                {/* Items */}
                <div className="space-y-1">
                    {bill.billItems?.map((item, index) => (
                        <div key={item.billItemId} className="flex text-[11px]">
                            <div className="flex-1 pr-1">
                                <span className="font-medium">{index + 1}. </span>
                                {item.itemName}
                            </div>
                            <div className="w-8 text-center">{item.quantity}</div>
                            <div className="w-16 text-right">
                                {formatCurrency(item.unitPrice).replace(" ₫", "")}
                            </div>
                            <div className="w-20 text-right font-medium">
                                {formatCurrency(item.total).replace(" ₫", "")}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-black my-2"></div>

                {/* Summary */}
                <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                        <span>{t("billing.subtotal", "Tạm tính")}:</span>
                        <span>{formatCurrency(bill.subtotal)}</span>
                    </div>

                    {bill.taxAmount > 0 && (
                        <div className="flex justify-between">
                            <span>
                                {t("billing.tax", "Thuế")} ({(bill.taxRate * 100).toFixed(0)}%):
                            </span>
                            <span>{formatCurrency(bill.taxAmount)}</span>
                        </div>
                    )}

                    {bill.serviceCharge > 0 && (
                        <div className="flex justify-between">
                            <span>{t("billing.serviceCharge", "Phí dịch vụ")}:</span>
                            <span>{formatCurrency(bill.serviceCharge)}</span>
                        </div>
                    )}

                    {bill.discountAmount > 0 && (
                        <div className="flex justify-between text-green-700">
                            <span>{t("billing.discount", "Giảm giá")}:</span>
                            <span>-{formatCurrency(bill.discountAmount)}</span>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="border-t border-double border-black my-2"></div>

                {/* Total */}
                <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="uppercase">{t("billing.total", "Tổng cộng")}:</span>
                    <span>{formatCurrency(bill.totalAmount)}</span>
                </div>

                {/* Payment Info */}
                {bill.paymentStatus === "paid" && (
                    <>
                        <div className="border-t border-dashed border-black my-2"></div>
                        <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between">
                                <span>{t("billing.paymentMethod", "Phương thức")}:</span>
                                <span>{getPaymentMethodText(bill.paymentMethod)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{t("billing.paidAmount", "Tiền khách đưa")}:</span>
                                <span>{formatCurrency(bill.paidAmount)}</span>
                            </div>
                            {bill.changeAmount > 0 && (
                                <div className="flex justify-between font-bold">
                                    <span>{t("billing.change", "Tiền thối")}:</span>
                                    <span>{formatCurrency(bill.changeAmount)}</span>
                                </div>
                            )}
                            {bill.paidAt && (
                                <div className="flex justify-between text-[10px]">
                                    <span>{t("billing.paidAt", "TG thanh toán")}:</span>
                                    <span>{formatDateTime(bill.paidAt)}</span>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Notes */}
                {bill.notes && (
                    <>
                        <div className="border-t border-dashed border-black my-2"></div>
                        <div className="text-[10px]">
                            <span className="font-bold">{t("billing.notes", "Ghi chú")}: </span>
                            {bill.notes}
                        </div>
                    </>
                )}

                {/* Divider */}
                <div className="border-t border-dashed border-black my-3"></div>

                {/* Footer */}
                <div className="text-center text-[10px] space-y-1">
                    <p className="font-bold">Cảm ơn quý khách!</p>
                    <p>Hẹn gặp lại!</p>
                    <p className="text-[9px] text-gray-600 mt-2">
                        *** {t("billing.invoiceCopy", "Bản in hóa đơn")} ***
                    </p>
                </div>

                {/* Barcode placeholder */}
                <div className="text-center mt-3">
                    <div className="text-[8px] font-mono tracking-widest">
                        ||| {bill.billNumber} |||
                    </div>
                </div>
            </div>
        );
    }
);

export default PrintableBill;
