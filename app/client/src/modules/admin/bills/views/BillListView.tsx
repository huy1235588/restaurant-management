'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { BillCard } from '../components/BillCard';
import { BillCardSkeleton } from '../components/BillCardSkeleton';
import { BillDetailDialog } from '../dialogs/BillDetailDialog';
import { ApplyDiscountDialog } from '../dialogs/ApplyDiscountDialog';
import { ProcessPaymentDialog } from '../dialogs/ProcessPaymentDialog';
import { VoidBillDialog } from '../dialogs/VoidBillDialog';
import { useBills } from '../hooks';
import { Bill, PaymentStatus } from '../types';
import { Search, Keyboard, RefreshCw } from 'lucide-react';

export function BillListView() {
    const { t } = useTranslation();
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [status, setStatus] = useState<PaymentStatus | ''>('');
    const [search, setSearch] = useState('');
    const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

    // Dialog states
    const [billToView, setBillToView] = useState<Bill | null>(null);
    const [billToDiscount, setBillToDiscount] = useState<Bill | null>(null);
    const [billToPayment, setBillToPayment] = useState<Bill | null>(null);
    const [billToVoid, setBillToVoid] = useState<Bill | null>(null);

    const { data, isLoading, error, refetch } = useBills({
        page,
        limit,
        paymentStatus: status || undefined,
        search: search || undefined,
    });

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

            // Always allow Escape
            if (e.key === 'Escape') {
                e.preventDefault();
                setShowKeyboardHelp(false);
                setBillToView(null);
                setBillToDiscount(null);
                setBillToPayment(null);
                setBillToVoid(null);
                return;
            }

            // Prevent shortcuts when typing
            if (isInputField && e.key !== '/') return;

            switch (e.key.toLowerCase()) {
                case '/':
                    e.preventDefault();
                    document.querySelector<HTMLInputElement>('input[placeholder*="Tìm"]')?.focus();
                    break;
                case 'r':
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        refetch();
                    }
                    break;
                case '1':
                    e.preventDefault();
                    setStatus('');
                    break;
                case '2':
                    e.preventDefault();
                    setStatus('pending');
                    break;
                case '3':
                    e.preventDefault();
                    setStatus('paid');
                    break;
                case '4':
                    e.preventDefault();
                    setStatus('cancelled');
                    break;
                case '?':
                    e.preventDefault();
                    setShowKeyboardHelp(true);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [refetch]);

    // Memoize callbacks
    const handleViewBill = useCallback((bill: Bill) => {
        setBillToView(bill);
    }, []);

    const handleApplyDiscount = useCallback((bill: Bill) => {
        setBillToDiscount(bill);
    }, []);

    const handleProcessPayment = useCallback((bill: Bill) => {
        setBillToPayment(bill);
    }, []);

    const handleVoidBill = useCallback((bill: Bill) => {
        setBillToVoid(bill);
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">{t('billing.title', 'Quản lý thanh toán')}</h1>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <BillCardSkeleton count={6} />
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">{t('billing.title', 'Quản lý thanh toán')}</h1>
                </div>
                <div className="text-center py-12 text-destructive">
                    {t('common.error', 'Lỗi')}: {error.message}
                </div>
            </div>
        );
    }

    const bills = data?.data || [];
    const totalPages = data?.meta?.totalPages || 1;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{t('billing.title', 'Quản lý thanh toán')}</h1>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowKeyboardHelp(true)}
                        title={t('common.keyboardShortcuts', 'Phím tắt (?)')}
                    >
                        <Keyboard className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t('common.refresh', 'Làm mới')}
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[250px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('billing.searchPlaceholder', 'Tìm theo mã hóa đơn, bàn...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select
                    value={status}
                    onValueChange={(value) => setStatus(value === 'all' ? '' : value as PaymentStatus | '')}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t('billing.filterStatus', 'Trạng thái')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('billing.status.all', 'Tất cả')}</SelectItem>
                        <SelectItem value="pending">{t('billing.status.pending', 'Chờ thanh toán')}</SelectItem>
                        <SelectItem value="paid">{t('billing.status.paid', 'Đã thanh toán')}</SelectItem>
                        <SelectItem value="refunded">{t('billing.status.refunded', 'Đã hoàn tiền')}</SelectItem>
                        <SelectItem value="cancelled">{t('billing.status.cancelled', 'Đã hủy')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Bill List */}
            {bills.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    {t('billing.noBills', 'Không tìm thấy hóa đơn nào')}
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {bills.map((bill) => (
                            <BillCard
                                key={bill.billId}
                                bill={bill}
                                onClick={() => handleViewBill(bill)}
                                onApplyDiscount={bill.paymentStatus === 'pending' ? () => handleApplyDiscount(bill) : undefined}
                                onProcessPayment={bill.paymentStatus === 'pending' ? () => handleProcessPayment(bill) : undefined}
                                onVoid={bill.paymentStatus !== 'cancelled' ? () => handleVoidBill(bill) : undefined}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                            >
                                {t('common.prev', 'Trước')}
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                {t('common.page', 'Trang')} {page} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                            >
                                {t('common.next', 'Sau')}
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Dialogs */}
            <BillDetailDialog
                open={!!billToView}
                onOpenChange={(open) => !open && setBillToView(null)}
                bill={billToView}
            />

            <ApplyDiscountDialog
                open={!!billToDiscount}
                onOpenChange={(open) => !open && setBillToDiscount(null)}
                bill={billToDiscount}
            />

            <ProcessPaymentDialog
                open={!!billToPayment}
                onOpenChange={(open) => !open && setBillToPayment(null)}
                bill={billToPayment}
            />

            <VoidBillDialog
                open={!!billToVoid}
                onOpenChange={(open) => !open && setBillToVoid(null)}
                bill={billToVoid}
            />

            {/* Keyboard Shortcuts Help Dialog */}
            <Dialog open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('common.keyboardShortcuts', 'Phím tắt')}</DialogTitle>
                        <DialogDescription>
                            {t('billing.keyboardHelpDescription', 'Các phím tắt có sẵn trong trang quản lý thanh toán')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{t('common.actions', 'Hành động')}</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('common.search', 'Tìm kiếm')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">/</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('common.refresh', 'Làm mới')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">R</kbd>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{t('billing.filterByStatus', 'Lọc trạng thái')}</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('billing.status.all', 'Tất cả')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">1</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('billing.status.pending', 'Chờ thanh toán')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">2</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('billing.status.paid', 'Đã thanh toán')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">3</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('billing.status.cancelled', 'Đã hủy')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">4</kbd>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">{t('common.other', 'Khác')}</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('common.showHelp', 'Hiển thị trợ giúp này')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">?</kbd>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('common.closeDialog', 'Đóng dialog')}</span>
                                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">ESC</kbd>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
