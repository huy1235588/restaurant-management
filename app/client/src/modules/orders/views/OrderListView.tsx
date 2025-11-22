'use client';

import { useState } from 'react';
import { useOrders } from '../hooks';
import { Order } from '../types';
import { OrderStatusBadge } from '../components';
import { formatCurrency, formatDateTime, canCancelOrder } from '../utils';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Plus, Trash2, FileText, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface OrderListViewProps {
    onViewDetails?: (order: Order) => void;
    onCancelOrder?: (order: Order) => void;
    onAddItems?: (order: Order) => void;
    onPreviewInvoice?: (order: Order) => void;
    onCreateOrder?: () => void;
}

export function OrderListView({
    onViewDetails,
    onCancelOrder,
    onAddItems,
    onPreviewInvoice,
    onCreateOrder,
}: OrderListViewProps) {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [search, setSearch] = useState('');

    const { data, isLoading, error, refetch } = useOrders({
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
    });

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    {error instanceof Error ? error.message : t('common.error')}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t('orders.title')}</h1>
                    <p className="text-muted-foreground">
                        {data?.meta?.total || 0} {t('orders.orderList').toLowerCase()}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        {t('common.refresh')}
                    </Button>
                    {onCreateOrder && (
                        <Button onClick={onCreateOrder}>
                            <Plus className="h-4 w-4 mr-2" />
                            {t('orders.createOrder')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder={t('common.search')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder={t('orders.filter.byStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('orders.filter.all')}</SelectItem>
                            <SelectItem value="pending">{t('orders.status.pending')}</SelectItem>
                            <SelectItem value="confirmed">{t('orders.status.confirmed')}</SelectItem>
                            <SelectItem value="ready">{t('orders.status.ready')}</SelectItem>
                            <SelectItem value="serving">{t('orders.status.serving')}</SelectItem>
                            <SelectItem value="completed">{t('orders.status.completed')}</SelectItem>
                            <SelectItem value="cancelled">{t('orders.status.cancelled')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Orders Table */}
            {isLoading ? (
                <div className="space-y-2">
                    {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className="h-16" />
                    ))}
                </div>
            ) : data && data.data.length > 0 ? (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('orders.orderNumber')}</TableHead>
                                <TableHead>{t('orders.table')}</TableHead>
                                <TableHead>Reservation</TableHead>
                                <TableHead>{t('orders.status')}</TableHead>
                                <TableHead>{t('orders.items')}</TableHead>
                                <TableHead>{t('orders.total')}</TableHead>
                                <TableHead>{t('orders.createdAt')}</TableHead>
                                <TableHead className="text-right">{t('common.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.data.map((order) => (
                                <TableRow key={order.orderId || order.orderId}>
                                    <TableCell className="font-medium">#{order.orderNumber || order.orderId}</TableCell>
                                    <TableCell>
                                        {order.table?.tableNumber || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {order.reservationId ? (
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                                                    {order.reservation?.reservationCode || `#${order.reservationId}`}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Walk-in</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <OrderStatusBadge status={order.status} />
                                    </TableCell>
                                    <TableCell>{(order.orderItems)?.length || 0}</TableCell>
                                    <TableCell className="font-semibold">
                                        {formatCurrency(order.finalAmount || order.totalAmount)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDateTime(order.createdAt)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {onViewDetails && (
                                                    <DropdownMenuItem
                                                        onClick={() => onViewDetails(order)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        {t('orders.orderDetails')}
                                                    </DropdownMenuItem>
                                                )}
                                                {onAddItems && order.status !== 'cancelled' && order.status !== 'completed' && (
                                                    <DropdownMenuItem
                                                        onClick={() => onAddItems(order)}
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        {t('orders.addItems')}
                                                    </DropdownMenuItem>
                                                )}
                                                {onPreviewInvoice && (
                                                    <DropdownMenuItem
                                                        onClick={() => onPreviewInvoice(order)}
                                                    >
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        {t('orders.previewInvoice')}
                                                    </DropdownMenuItem>
                                                )}
                                                {onCancelOrder && canCancelOrder(order.status) && (
                                                    <DropdownMenuItem
                                                        onClick={() => onCancelOrder(order)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        {t('orders.cancelOrder')}
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            ) : (
                <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t('orders.noOrders')}</h3>
                    <p className="text-muted-foreground mb-4">
                        Bắt đầu bằng cách tạo đơn hàng mới
                    </p>
                    {onCreateOrder && (
                        <Button onClick={onCreateOrder}>
                            <Plus className="h-4 w-4 mr-2" />
                            {t('orders.createOrder')}
                        </Button>
                    )}
                </div>
            )}

            {/* Pagination */}
            {data && data.meta && data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Trang {data.meta.page} / {data.meta.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                        >
                            {t('common.previous')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page >= data.meta.totalPages}
                        >
                            {t('common.next')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
