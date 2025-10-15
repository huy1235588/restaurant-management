import { Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Order, OrderStatus } from '@/types';

interface KitchenOrderCardProps {
    order: Order;
    onStartPreparing?: (orderId: number) => void;
    onMarkReady?: (orderId: number) => void;
}

export function KitchenOrderCard({ 
    order, 
    onStartPreparing, 
    onMarkReady 
}: KitchenOrderCardProps) {
    return (
        <Card
            className={`${
                order.status === 'confirmed'
                    ? 'border-orange-500 border-2'
                    : 'border-blue-500 border-2'
            }`}
        >
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">
                        #{order.orderId}
                    </CardTitle>
                    <Badge
                        className={
                            order.status === 'confirmed'
                                ? 'bg-orange-500'
                                : 'bg-blue-500'
                        }
                    >
                        {order.status === 'confirmed' ? 'NEW' : 'PREPARING'}
                    </Badge>
                </div>
                <CardDescription className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4" />
                    {new Date(order.orderTime).toLocaleTimeString()}
                    {' • '}
                    Table {order.table?.tableNumber || order.tableId}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Order Items */}
                <div className="space-y-3 mb-4">
                    {order.orderItems.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex justify-between items-start p-2 bg-slate-50 dark:bg-slate-800 rounded"
                        >
                            <div className="flex-1">
                                <p className="font-semibold">
                                    {item.quantity}x {item.menuItem?.itemName || 'Item'}
                                </p>
                                {item.notes && (
                                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                        ⚠️ {item.notes}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Special Requests */}
                {order.specialRequests && (
                    <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            📝 Special Request:
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            {order.specialRequests}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {order.status === 'confirmed' && onStartPreparing && (
                        <Button
                            className="flex-1"
                            size="lg"
                            onClick={() => onStartPreparing(order.orderId)}
                        >
                            Start Preparing
                        </Button>
                    )}
                    {order.status === 'preparing' && onMarkReady && (
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            size="lg"
                            onClick={() => onMarkReady(order.orderId)}
                        >
                            Mark as Ready
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
