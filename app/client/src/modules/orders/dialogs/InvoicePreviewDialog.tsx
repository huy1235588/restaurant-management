'use client';

import { useRef } from 'react';
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
import { Printer, Download } from 'lucide-react';

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

    if (!order) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>{t('orders.previewInvoice')}</DialogTitle>
                    <DialogDescription>
                        Hóa đơn đơn hàng #{order.id}
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[60vh]">
                    <div ref={invoiceRef} className="bg-white p-8 space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold">NHÀ HÀNG ABC</h1>
                            <p className="text-sm text-muted-foreground">
                                Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Điện thoại: (028) 1234 5678
                            </p>
                        </div>

                        <Separator />

                        {/* Invoice Info */}
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-center">HÓA ĐƠN THANH TOÁN</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Số hóa đơn:</p>
                                    <p className="font-medium">#{order.id}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Ngày giờ:</p>
                                    <p className="font-medium">{formatDateTime(order.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Bàn:</p>
                                    <p className="font-medium">{order.table?.tableNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Nhân viên:</p>
                                    <p className="font-medium">{order.staff?.fullName || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Items */}
                        <div>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Món</th>
                                        <th className="text-center py-2">SL</th>
                                        <th className="text-right py-2">Đơn giá</th>
                                        <th className="text-right py-2">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items?.map((item, index) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="py-2">
                                                <div>
                                                    <p className="font-medium">
                                                        {item.menuItem?.name || 'Unknown'}
                                                    </p>
                                                    {item.note && (
                                                        <p className="text-xs text-muted-foreground italic">
                                                            Ghi chú: {item.note}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-center py-2">{item.quantity}</td>
                                            <td className="text-right py-2">
                                                {formatCurrency(item.menuItem?.price || 0)}
                                            </td>
                                            <td className="text-right py-2 font-medium">
                                                {formatCurrency((item.menuItem?.price || 0) * item.quantity)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Separator />

                        {/* Total */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-lg font-semibold">
                                <span>TỔNG CỘNG:</span>
                                <span>{formatCurrency(order.totalAmount)}</span>
                            </div>
                            {order.note && (
                                <div className="text-sm">
                                    <p className="text-muted-foreground">Ghi chú:</p>
                                    <p>{order.note}</p>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Footer */}
                        <div className="text-center space-y-2 text-sm">
                            <p className="font-medium">Cảm ơn quý khách!</p>
                            <p className="text-muted-foreground">Hẹn gặp lại quý khách</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>
                        {t('common.close')}
                    </Button>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        {t('orders.printInvoice')}
                    </Button>
                    <Button onClick={handleExportPDF}>
                        <Download className="h-4 w-4 mr-2" />
                        {t('orders.exportPDF')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
