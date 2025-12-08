'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { BillStatusBadge } from '../components/BillStatusBadge';
import { BillItemList } from '../components/BillItemList';
import { BillSummary } from '../components/BillSummary';
import { PrintableBill } from '../components/PrintableBill';
import { ApplyDiscountDialog } from '../dialogs/ApplyDiscountDialog';
import { ProcessPaymentDialog } from '../dialogs/ProcessPaymentDialog';
import { VoidBillDialog } from '../dialogs/VoidBillDialog';
import { useBill } from '../hooks';
import { formatCurrency, formatDateTime } from '../utils';
import {
    ArrowLeft,
    Printer,
    Percent,
    CreditCard,
    XCircle,
    Keyboard,
    Receipt,
} from 'lucide-react';
import { settingsApi } from '@/modules/admin/settings/services/settings.service';
import { RestaurantSettings } from '@/modules/admin/settings/types';

interface BillDetailViewProps {
    billId: number;
}

export function BillDetailView({ billId }: BillDetailViewProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const printRef = useRef<HTMLDivElement>(null);
    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
    const [showDiscountDialog, setShowDiscountDialog] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [showVoidDialog, setShowVoidDialog] = useState(false);
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings | null>(null);

    const { data: bill, isLoading, error } = useBill(billId);

    // Fetch restaurant settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsApi.getSettings();
                setRestaurantSettings(data);
            } catch (error) {
                console.error('Failed to fetch restaurant settings:', error);
            }
        };
        fetchSettings();
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

            // Always allow Escape
            if (e.key === 'Escape') {
                e.preventDefault();
                setShowKeyboardHelp(false);
                setShowDiscountDialog(false);
                setShowPaymentDialog(false);
                setShowVoidDialog(false);
                setShowPrintPreview(false);
                return;
            }

            // Prevent shortcuts when typing
            if (isInputField) return;

            if (!bill) return;

            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    handleBack();
                    break;
                case 'p':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        handlePrint();
                    } else if (bill.paymentStatus === 'pending') {
                        e.preventDefault();
                        setShowPaymentDialog(true);
                    }
                    break;
                case 'd':
                    if (bill.paymentStatus === 'pending') {
                        e.preventDefault();
                        setShowDiscountDialog(true);
                    }
                    break;
                case 'x':
                    if (bill.paymentStatus !== 'cancelled') {
                        e.preventDefault();
                        setShowVoidDialog(true);
                    }
                    break;
                case 'o':
                    if (bill.orderId) {
                        e.preventDefault();
                        router.push(`/admin/orders/${bill.orderId}`);
                    }
                    break;
                case '?':
                    e.preventDefault();
                    setShowKeyboardHelp(true);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [bill, router]);

    const handleBack = () => {
        router.push('/admin/bills');
    };

    const handlePrint = () => {
        setShowPrintPreview(true);
    };

    const handleConfirmPrint = () => {
        window.print();
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('common.back', 'Quay lại')}
                </Button>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-4">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-48 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !bill) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('common.back', 'Quay lại')}
                </Button>
                <div className="text-center py-12 text-destructive">
                    {error?.message || t('billing.errors.billNotFound', 'Không tìm thấy hóa đơn')}
                </div>
            </div>
        );
    }

    const isPending = bill.paymentStatus === 'pending';
    const isCancelled = bill.paymentStatus === 'cancelled';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('common.back', 'Quay lại')}
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold">{bill.billNumber}</h1>
                            <BillStatusBadge status={bill.paymentStatus} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {formatDateTime(bill.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowKeyboardHelp(true)}
                        title={t('common.keyboardShortcuts', 'Phím tắt (?)')}
                    >
                        <Keyboard className="h-4 w-4" />
                    </Button>
                    {isPending && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setShowDiscountDialog(true)}
                            >
                                <Percent className="mr-2 h-4 w-4" />
                                {t('billing.applyDiscount', 'Giảm giá')}
                            </Button>
                            <Button onClick={() => setShowPaymentDialog(true)}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                {t('billing.processPayment', 'Thanh toán')}
                            </Button>
                        </>
                    )}
                    {!isCancelled && (
                        <Button
                            variant="destructive"
                            onClick={() => setShowVoidDialog(true)}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            {t('billing.voidBill', 'Hủy hóa đơn')}
                        </Button>
                    )}
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        {t('common.print', 'In')}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content - Left Column (2/3) */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Bill Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('billing.billInfo', 'Thông tin hóa đơn')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {t('billing.table', 'Bàn')}
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {bill.table?.tableNumber || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {t('billing.staff', 'Nhân viên')}
                                    </p>
                                    <p className="text-lg">
                                        {bill.staff?.fullName || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {t('billing.orderNumber', 'Mã đơn hàng')}
                                    </p>
                                    <Button
                                        variant="link"
                                        className="h-auto p-0 text-lg"
                                        onClick={() => router.push(`/admin/orders/${bill.orderId}`)}
                                    >
                                        #{bill.order?.orderNumber || bill.orderId}
                                    </Button>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {t('billing.paymentMethod', 'Phương thức')}
                                    </p>
                                    <p className="text-lg">
                                        {bill.paymentMethod
                                            ? t(`billing.paymentMethods.${bill.paymentMethod}`, bill.paymentMethod)
                                            : t('billing.notPaid', 'Chưa thanh toán')}
                                    </p>
                                </div>
                            </div>
                            {bill.paidAt && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {t('billing.paidAt', 'Thời gian thanh toán')}
                                        </p>
                                        <p className="text-lg">{formatDateTime(bill.paidAt)}</p>
                                    </div>
                                </>
                            )}
                            {bill.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {t('billing.notes', 'Ghi chú')}
                                        </p>
                                        <p className="text-sm">{bill.notes}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Bill Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {t('billing.items', 'Danh sách món')} ({bill.billItems?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BillItemList items={bill.billItems || []} />
                        </CardContent>
                    </Card>

                    {/* Payment History */}
                    {bill.payments && bill.payments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('billing.paymentHistory', 'Lịch sử thanh toán')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {bill.payments.map((payment) => (
                                        <div
                                            key={payment.paymentId}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {t(`billing.paymentMethods.${payment.paymentMethod}`, payment.paymentMethod)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDateTime(payment.createdAt)}
                                                </p>
                                                {payment.transactionId && (
                                                    <p className="text-xs text-muted-foreground">
                                                        ID: {payment.transactionId}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="font-bold text-lg">
                                                {formatCurrency(payment.amount)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Right Column (1/3) */}
                <div className="space-y-6">
                    {/* Bill Summary */}
                    <BillSummary bill={bill} showActions={false} />

                    {/* Additional Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('billing.additionalInfo', 'Thông tin bổ sung')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {t('billing.billNumber', 'Mã hóa đơn')}
                                </p>
                                <p className="text-sm font-mono">{bill.billNumber}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {t('billing.createdAt', 'Ngày tạo')}
                                </p>
                                <p className="text-sm">{formatDateTime(bill.createdAt)}</p>
                            </div>
                            {bill.updatedAt && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {t('billing.updatedAt', 'Cập nhật lần cuối')}
                                        </p>
                                        <p className="text-sm">{formatDateTime(bill.updatedAt)}</p>
                                    </div>
                                </>
                            )}
                            {bill.changeAmount > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {t('billing.changeGiven', 'Tiền thừa')}
                                        </p>
                                        <p className="text-sm font-bold text-green-600">
                                            {formatCurrency(bill.changeAmount)}
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialogs */}
            <ApplyDiscountDialog
                open={showDiscountDialog}
                onOpenChange={setShowDiscountDialog}
                bill={bill}
            />

            <ProcessPaymentDialog
                open={showPaymentDialog}
                onOpenChange={setShowPaymentDialog}
                bill={bill}
            />

            <VoidBillDialog
                open={showVoidDialog}
                onOpenChange={setShowVoidDialog}
                bill={bill}
            />

            {/* Keyboard Shortcuts Help Dialog */}
            <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {t('billing.keyboardShortcutsTitle', 'Phím tắt - Chi tiết hóa đơn')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('billing.keyboardHelpDescription', 'Các phím tắt có sẵn trong trang chi tiết hóa đơn')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{t('common.actions', 'Hành động')}</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        {t('common.back', 'Quay lại danh sách')}
                                    </span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">B</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        {t('common.print', 'In hóa đơn')}
                                    </span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+P</kbd>
                                </div>
                                {isPending && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                {t('billing.applyDiscount', 'Áp dụng giảm giá')}
                                            </span>
                                            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">D</kbd>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                {t('billing.processPayment', 'Thanh toán')}
                                            </span>
                                            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">P</kbd>
                                        </div>
                                    </>
                                )}
                                {!isCancelled && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            {t('billing.voidBill', 'Hủy hóa đơn')}
                                        </span>
                                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">X</kbd>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        {t('billing.viewOrder', 'Xem đơn hàng')}
                                    </span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">O</kbd>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{t('common.other', 'Khác')}</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        {t('common.showHelp', 'Hiển thị trợ giúp này')}
                                    </span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">?</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        {t('common.closeDialog', 'Đóng dialog')}
                                    </span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">ESC</kbd>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Print Preview Dialog */}
            <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
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
                            restaurantSettings={restaurantSettings}
                        />
                    </div>

                    {/* Print Actions */}
                    <div className="flex gap-2 justify-end mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowPrintPreview(false)}
                        >
                            {t('common.cancel', 'Hủy')}
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
                <PrintableBill ref={printRef} bill={bill} restaurantSettings={restaurantSettings} />
            </div>
        </div>
    );
}
