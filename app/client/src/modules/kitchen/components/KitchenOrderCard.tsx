"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { KitchenOrder } from "../types/kitchen.types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { PrepTimeIndicator } from "./PrepTimeIndicator";
import { OrderItemsList } from "./OrderItemsList";
import { KitchenHelpers } from "../utils/kitchen-helpers";
import { formatOrderNumber } from "@/modules/order";

interface KitchenOrderCardProps {
    order: KitchenOrder;
    onStartPreparing: (orderId: number) => void;
    onCompleteOrder: (orderId: number) => void;
    onCancel: (orderId: number) => void;
}

export function KitchenOrderCard({
    order,
    onStartPreparing,
    onCompleteOrder,
    onCancel,
}: KitchenOrderCardProps) {
    const [isNew, setIsNew] = useState(false);

    // Flash effect for new orders (< 5 seconds old)
    useEffect(() => {
        const elapsedMs = Date.now() - new Date(order.createdAt).getTime();
        if (elapsedMs < 5000) {
            setIsNew(true);
            const timer = setTimeout(() => setIsNew(false), 5000 - elapsedMs);
            return () => clearTimeout(timer);
        }
    }, [order.createdAt]);

    const canStart = KitchenHelpers.canStartOrder(order.status);
    const canComplete = KitchenHelpers.canComplete(order.status);

    return (
        <Card
            className={`
        transition-all duration-300
        ${isNew ? "ring-2 ring-red-500 animate-pulse" : ""}
      `}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatOrderNumber(order.order.orderNumber)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Table: {KitchenHelpers.getTableDisplayName(order.order.table)}
                        </p>
                        {order.order.customerName && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                {order.order.customerName}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <OrderStatusBadge status={order.status} />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pb-3">
                {/* Prep Time Indicator */}
                <div className="mb-3">
                    <PrepTimeIndicator
                        createdAt={order.createdAt}
                        status={order.status}
                        completedAt={order.completedAt}
                    />
                </div>

                {/* Order Items */}
                <OrderItemsList items={order.order.orderItems} />

                {/* Chef Info */}
                {order.chef && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>Chef: {order.chef.fullName}</span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-3">
                {/* Start Preparing Button */}
                {canStart && (
                    <Button
                        className="w-full"
                        onClick={() => onStartPreparing(order.kitchenOrderId)}
                        size="lg"
                    >
                        Start Preparing
                    </Button>
                )}

                {/* Complete Button */}
                {canComplete && (
                    <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => onCompleteOrder(order.kitchenOrderId)}
                        size="lg"
                    >
                        Complete Order
                    </Button>
                )}

                {/* Cancel Button */}
                {canStart && (
                    <Button
                        className="w-full"
                        variant="destructive"
                        onClick={() => onCancel(order.kitchenOrderId)}
                        size="sm"
                    >
                        Cancel
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
