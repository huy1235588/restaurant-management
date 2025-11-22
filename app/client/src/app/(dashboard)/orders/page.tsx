'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
    OrderListView,
    CreateOrderDialog,
    AddItemsDialog,
    CancelItemDialog,
    CancelOrderDialog,
    OrderDetailsDialog,
    InvoicePreviewDialog,
    useOrderSocket,
    Order,
    OrderItem,
} from '@/modules/orders';

export default function OrdersPage() {
    // Real-time WebSocket connection
    useOrderSocket();

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [addItemsDialogOpen, setAddItemsDialogOpen] = useState(false);
    const [cancelItemDialogOpen, setCancelItemDialogOpen] = useState(false);
    const [cancelOrderDialogOpen, setCancelOrderDialogOpen] = useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

    // Selected entities
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItem | null>(null);

    // Handlers for OrderListView callbacks
    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setDetailsDialogOpen(true);
    };

    const handleAddItems = (order: Order) => {
        setSelectedOrder(order);
        setAddItemsDialogOpen(true);
    };

    const handleCancelOrder = (order: Order) => {
        setSelectedOrder(order);
        setCancelOrderDialogOpen(true);
    };

    const handlePreviewInvoice = (order: Order) => {
        setSelectedOrder(order);
        setInvoiceDialogOpen(true);
    };

    // Handlers from OrderDetailsDialog
    const handleCancelItem = (item: OrderItem) => {
        setSelectedOrderItem(item);
        setCancelItemDialogOpen(true);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Quản Lý Đơn Hàng</h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý đơn hàng và theo dõi trạng thái
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo Đơn Hàng
                </Button>
            </div>

            {/* Order List */}
            <OrderListView
                onViewDetails={handleViewDetails}
                onAddItems={handleAddItems}
                onCancelOrder={handleCancelOrder}
                onPreviewInvoice={handlePreviewInvoice}
            />

            {/* Create Order Dialog */}
            <CreateOrderDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
            />

            {/* Add Items Dialog */}
            {selectedOrder && (
                <AddItemsDialog
                    open={addItemsDialogOpen}
                    onClose={() => setAddItemsDialogOpen(false)}
                    orderId={selectedOrder.orderId}
                />
            )}

            {/* Cancel Item Dialog */}
            <CancelItemDialog
                open={cancelItemDialogOpen}
                onClose={() => setCancelItemDialogOpen(false)}
                item={selectedOrderItem}
                orderId={selectedOrder?.orderId || 0}
            />

            {/* Cancel Order Dialog */}
            {selectedOrder && (
                <CancelOrderDialog
                    open={cancelOrderDialogOpen}
                    onClose={() => setCancelOrderDialogOpen(false)}
                    order={selectedOrder}
                />
            )}

            {/* Order Details Dialog */}
            <OrderDetailsDialog
                open={detailsDialogOpen}
                onClose={() => setDetailsDialogOpen(false)}
                orderId={selectedOrder?.orderId || null}
                onAddItems={(order) => {
                    setDetailsDialogOpen(false);
                    setSelectedOrder(order);
                    setAddItemsDialogOpen(true);
                }}
                onCancelItem={(order, item) => {
                    setSelectedOrder(order);
                    setSelectedOrderItem(item);
                    setCancelItemDialogOpen(true);
                }}
                onCancelOrder={(order) => {
                    setDetailsDialogOpen(false);
                    setSelectedOrder(order);
                    setCancelOrderDialogOpen(true);
                }}
                onPreviewInvoice={(order) => {
                    setDetailsDialogOpen(false);
                    setSelectedOrder(order);
                    setInvoiceDialogOpen(true);
                }}
            />

            {/* Invoice Preview Dialog */}
            {selectedOrder && (
                <InvoicePreviewDialog
                    open={invoiceDialogOpen}
                    onClose={() => setInvoiceDialogOpen(false)}
                    order={selectedOrder}
                />
            )}
        </div>
    );
}
