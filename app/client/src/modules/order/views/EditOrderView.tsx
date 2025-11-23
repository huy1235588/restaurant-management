'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { MenuItemSelector } from '../components/MenuItemSelector';
import { ShoppingCart } from '../components/ShoppingCart';
import { OrderSummaryCard } from '../components/OrderSummaryCard';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { useOrderById, useAddItems } from '../hooks';
import { ShoppingCartItem, OrderItem } from '../types';
import { formatOrderNumber, formatCurrency, calculateOrderFinancials } from '../utils';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

interface EditOrderViewProps {
    orderId: number;
}

export function EditOrderView({ orderId }: EditOrderViewProps) {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<ShoppingCartItem[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const { data: order, isLoading, error } = useOrderById(orderId);
    const addItemsMutation = useAddItems();

    // Warn about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const handleBack = () => {
        if (hasUnsavedChanges) {
            const confirmed = confirm('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời đi?');
            if (!confirmed) return;
        }
        router.push(`/orders/${orderId}`);
    };

    const handleSubmit = async () => {
        if (cartItems.length === 0) {
            alert('Vui lòng thêm ít nhất một món');
            return;
        }

        await addItemsMutation.mutateAsync({
            orderId,
            data: {
                items: cartItems.map((item) => ({
                    itemId: item.menuItemId,
                    quantity: item.quantity,
                    specialRequest: item.specialRequests,
                })),
            },
        });
        setHasUnsavedChanges(false);
        // Navigation handled by useAddItems hook
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>
                <div className="text-center py-12 text-muted-foreground">
                    Đang tải...
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>
                <div className="text-center py-12 text-destructive">
                    {error?.message || 'Không tìm thấy đơn hàng'}
                </div>
            </div>
        );
    }

    const currentFinancials = calculateOrderFinancials(order.orderItems || []);
    
    // Convert cart items to OrderItem format
    const tempNewItems: OrderItem[] = cartItems.map((item, index) => ({
        orderItemId: -(index + 1), // Negative IDs for temp items
        orderId: order.orderId,
        itemId: item.menuItemId,
        menuItem: {
            itemId: item.menuItemId,
            itemName: item.name,
            price: item.price,
            categoryId: 0,
            description: null,
            imageUrl: null,
            isAvailable: true,
        },
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        specialRequest: item.specialRequests || null,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }));
    
    const newItemsSubtotal = tempNewItems.reduce(
        (sum: number, item: any) => sum + item.totalPrice,
        0
    );
    
    const newFinancials = calculateOrderFinancials([
        ...(order.orderItems || []),
        ...tempNewItems,
    ]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">
                            Thêm món - {formatOrderNumber(order.orderNumber)}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Bàn {order.table?.tableNumber || 'N/A'}
                        </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Current Order Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Đơn hàng hiện tại</CardTitle>
                            <CardDescription>
                                {order.orderItems?.length || 0} món - Tổng: {formatCurrency(currentFinancials.total)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {order.orderItems?.map((item: any) => (
                                    <div
                                        key={item.orderItemId}
                                        className="flex justify-between text-sm"
                                    >
                                        <span className="flex-1">
                                            {item.menuItem?.name || 'Unknown'} x{item.quantity}
                                            {item.specialRequests && (
                                                <span className="text-muted-foreground ml-2">
                                                    ({item.specialRequests})
                                                </span>
                                            )}
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(item.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thêm món mới</CardTitle>
                            <CardDescription>
                                Chọn món ăn để thêm vào đơn hàng
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MenuItemSelector
                                cartItems={cartItems}
                                onAddItem={(item) => {
                                    setCartItems((prev) => {
                                        const existing = prev.find(
                                            (i) => i.menuItemId === item.menuItemId
                                        );
                                        if (existing) {
                                            return prev.map((i) =>
                                                i.menuItemId === item.menuItemId
                                                    ? { ...i, quantity: i.quantity + item.quantity }
                                                    : i
                                            );
                                        }
                                        return [...prev, item];
                                    });
                                    setHasUnsavedChanges(true);
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* Changes Summary */}
                    {cartItems.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Tổng quan thay đổi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Món mới ({cartItems.length})</h4>
                                    <div className="space-y-1">
                                        {cartItems.map((item) => (
                                            <div
                                                key={item.menuItemId}
                                                className="flex justify-between text-sm"
                                            >
                                                <span>
                                                    {item.name} x{item.quantity}
                                                </span>
                                                <span className="font-medium">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tổng hiện tại:</span>
                                        <span>{formatCurrency(currentFinancials.total)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Thêm:</span>
                                        <span>{formatCurrency(newItemsSubtotal)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-semibold">
                                        <span>Tổng mới:</span>
                                        <span>{formatCurrency(newFinancials.total)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {addItemsMutation.isError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {addItemsMutation.error?.message || 'Đã xảy ra lỗi'}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Shopping Cart */}
                    {cartItems.length > 0 && (
                        <ShoppingCart
                            items={cartItems}
                            onUpdateQuantity={(menuItemId, quantity) => {
                                setCartItems((prev) =>
                                    prev.map((item) =>
                                        item.menuItemId === menuItemId
                                            ? { ...item, quantity }
                                            : item
                                    )
                                );
                                setHasUnsavedChanges(true);
                            }}
                            onRemoveItem={(menuItemId) => {
                                setCartItems((prev) =>
                                    prev.filter((item) => item.menuItemId !== menuItemId)
                                );
                                setHasUnsavedChanges(true);
                            }}
                        />
                    )}

                    {/* Summary */}
                    <OrderSummaryCard
                        subtotal={newFinancials.subtotal}
                        serviceCharge={newFinancials.serviceCharge}
                        tax={newFinancials.tax}
                        discount={newFinancials.discount}
                        total={newFinancials.total}
                    />

                    {/* Actions */}
                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={cartItems.length === 0 || addItemsMutation.isPending}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {addItemsMutation.isPending ? 'Đang lưu...' : 'Thêm món'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
