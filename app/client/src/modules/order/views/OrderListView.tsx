'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { OrderCard } from '../components/OrderCard';
import { CancelOrderDialog } from '../dialogs/CancelOrderDialog';
import { useOrders, useOrderSocket } from '../hooks';
import { Order, OrderStatus } from '../types';
import { Plus, Search, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';

export function OrderListView() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [status, setStatus] = useState<OrderStatus | ''>('');
    const [search, setSearch] = useState('');
    const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const { data, isLoading, error } = useOrders({
        page,
        limit,
        status: status || undefined,
        search: search || undefined,
    });

    // Real-time updates
    useOrderSocket({
        enableNotifications: true,
        enableSound: false,
    });

    // Fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
            toast.info("Fullscreen Mode", {
                description: "Press F11 or ESC to exit fullscreen",
                duration: 3000,
            });
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Listen to fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };
    }, []);

    // Keyboard shortcut for fullscreen (F11)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F11") {
                e.preventDefault();
                toggleFullscreen();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleCreateOrder = () => {
        router.push('/orders/new');
    };

    const handleCancelOrder = (order: Order) => {
        setOrderToCancel(order);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
                    <Button onClick={handleCreateOrder}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo đơn hàng
                    </Button>
                </div>
                <div className="text-center py-12 text-muted-foreground">
                    Đang tải...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
                    <Button onClick={handleCreateOrder}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo đơn hàng
                    </Button>
                </div>
                <div className="text-center py-12 text-destructive">
                    Lỗi: {error.message}
                </div>
            </div>
        );
    }

    const orders = data?.data || [];
    const totalPages = data?.meta?.totalPages || 1;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={toggleFullscreen}>
                        {isFullscreen ? (
                            <Minimize2 className="mr-2 h-4 w-4" />
                        ) : (
                            <Maximize2 className="mr-2 h-4 w-4" />
                        )}
                        {isFullscreen ? "Exit" : "Fullscreen"}
                    </Button>
                    <Button onClick={handleCreateOrder}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo đơn hàng
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm theo mã đơn, tên, SĐT..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={status} onValueChange={(value) => setStatus(value === "all" ? '' : value as OrderStatus | '')}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="pending">Đang chờ</SelectItem>
                        <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                        <SelectItem value="ready">Sẵn sàng</SelectItem>
                        <SelectItem value="serving">Đang phục vụ</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Order List */}
            {orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    Không tìm thấy đơn hàng nào
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {orders.map((order) => (
                            <OrderCard
                                key={order.orderId}
                                order={order}
                                onCancelOrder={handleCancelOrder}
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
                                Trước
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Trang {page} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                            >
                                Sau
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Cancel Order Dialog */}
            <CancelOrderDialog
                open={!!orderToCancel}
                onOpenChange={(open) => !open && setOrderToCancel(null)}
                order={orderToCancel}
            />
        </div>
    );
}
