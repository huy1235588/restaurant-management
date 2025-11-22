'use client';

import { useRef, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Order } from '../types';
import { formatCurrency, formatDateTime } from '../utils';
import { useTranslation } from 'react-i18next';
import { Printer, Download, Receipt, Store } from 'lucide-react';
import Image from 'next/image';

interface InvoicePreviewDialogProps {
    open: boolean;
    onClose: () => void;
    order: Order | null;
}

export function InvoicePreviewDialog({ open, onClose, order }: InvoicePreviewDialogProps) {
    const { t } = useTranslation();
    const invoiceRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = () => {
        // TODO: Implement PDF export using jsPDF or similar
        window.print();
    };

    // Calculate subtotal and items count
    const invoiceStats = useMemo(() => {
        if (!order?.orderItems) return { itemCount: 0, subtotal: 0 };

        return {
            itemCount: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: order.totalAmount,
        };
    }, [order]);

    if (!order) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 gap-0 print:max-h-none">
                <DialogHeader className="px-6 pt-6 pb-4 border-b print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Receipt className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                {t('orders.previewInvoice')}
                            </DialogTitle>
                            <DialogDescription>
                                Hóa đơn đơn hàng #{order.orderId}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Invoice Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-180px)] bg-linear-to-b from-background to-muted/30 print:max-h-none print:bg-transparent">
                    <div ref={invoiceRef} className="max-w-2xl mx-auto bg-white dark:bg-gray-900 m-6 p-8 rounded-lg shadow-lg print:shadow-none print:m-0">
                        {/* Header with Logo */}
                        <div className="text-center space-y-3 mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 ring-4 ring-primary/10">
                                    <Image
                                        src="/images/logo/logo.png"
                                        alt="Restaurant Logo"
                                        width={80}
                                        height={80}
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                NHÀ HÀNG ABC
                            </h1>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</p>
                                <p>Điện thoại: (028) 1234 5678</p>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Invoice Title */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold mb-2">HÓA ĐƠN THANH TOÁN</h2>
                            <div className="inline-block px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                                <p className="text-sm font-medium text-primary">
                                    Số hóa đơn: #{order.orderId}
                                </p>
                            </div>
                        </div>

                        {/* Invoice Info Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-muted/50">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Ngày giờ</p>
                                <p className="font-semibold">{formatDateTime(order.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Bàn</p>
                                <p className="font-semibold">{order.table?.tableNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Nhân viên</p>
                                <p className="font-semibold">{order.staff?.fullName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Tổng món</p>
                                <p className="font-semibold">{invoiceStats.itemCount} món</p>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Items Table */}
                        <div className="mb-6">
                            <div className="overflow-hidden rounded-lg border">
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Món</th>
                                            <th className="text-center py-3 px-4 font-semibold text-sm w-20">SL</th>
                                            <th className="text-right py-3 px-4 font-semibold text-sm w-28">Đơn giá</th>
                                            <th className="text-right py-3 px-4 font-semibold text-sm w-32">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {order.orderItems?.map((item, index) => (
                                            <tr key={item.orderId} className="hover:bg-muted/50 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-medium">
                                                            {item.menuItem?.itemName || 'Unknown'}
                                                        </p>
                                                        {item.specialRequest && (
                                                            <p className="text-xs text-muted-foreground italic mt-1">
                                                                ↳ {item.specialRequest}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-center py-3 px-4 font-medium">
                                                    {item.quantity}
                                                </td>
                                                <td className="text-right py-3 px-4">
                                                    {formatCurrency(item.menuItem?.price || 0)}
                                                </td>
                                                <td className="text-right py-3 px-4 font-semibold">
                                                    {formatCurrency((item.menuItem?.price || 0) * item.quantity)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Total Section */}
                        <div className="space-y-3 mb-6">
                            <div className="p-5 rounded-xl bg-linear-to-br from-primary/15 via-primary/10 to-primary/5 border-2 border-primary/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">TỔNG CỘNG</span>
                                    <span className="text-3xl font-bold text-primary">
                                        {formatCurrency(order.totalAmount)}
                                    </span>
                                </div>
                            </div>

                            {order.notes && (
                                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                                    <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                                        Ghi chú đơn hàng
                                    </p>
                                    <p className="text-sm text-amber-800 dark:text-amber-300">
                                        {order.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        <Separator className="my-6" />

                        {/* Footer */}
                        <div className="text-center space-y-3">
                            <div className="inline-block px-6 py-3 rounded-lg bg-linear-to-r from-primary/10 to-primary/5">
                                <p className="font-bold text-lg mb-1">Cảm ơn quý khách!</p>
                                <p className="text-sm text-muted-foreground">Hẹn gặp lại quý khách</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Hóa đơn này được tạo tự động bởi hệ thống
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-muted/30 gap-2 print:hidden">
                    <Button variant="outline" onClick={onClose}>
                        {t('common.close')}
                    </Button>
                    <Button variant="outline" onClick={handlePrint} className="gap-2">
                        <Printer className="h-4 w-4" />
                        {t('orders.printInvoice')}
                    </Button>
                    <Button onClick={handleExportPDF} className="gap-2">
                        <Download className="h-4 w-4" />
                        {t('orders.exportPDF')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}