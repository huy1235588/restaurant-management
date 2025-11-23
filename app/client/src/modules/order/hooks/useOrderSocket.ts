"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    OrderCreatedEvent,
    OrderUpdatedEvent,
    OrderItemsAddedEvent,
    OrderItemCancelledEvent,
    OrderCancelledEvent,
    KitchenOrderReadyEvent,
} from "../types";
import { orderKeys } from "./useOrders";

const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

interface UseOrderSocketOptions {
    onOrderCreated?: (event: OrderCreatedEvent) => void;
    onOrderUpdated?: (event: OrderUpdatedEvent) => void;
    onItemsAdded?: (event: OrderItemsAddedEvent) => void;
    onItemCancelled?: (event: OrderItemCancelledEvent) => void;
    onOrderCancelled?: (event: OrderCancelledEvent) => void;
    onKitchenOrderReady?: (event: KitchenOrderReadyEvent) => void;
    enableNotifications?: boolean;
    enableSound?: boolean;
}

export function useOrderSocket(options: UseOrderSocketOptions = {}) {
    const {
        onOrderCreated,
        onOrderUpdated,
        onItemsAdded,
        onItemCancelled,
        onOrderCancelled,
        onKitchenOrderReady,
        enableNotifications = true,
        enableSound = false,
    } = options;

    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        // Connection event handlers
        newSocket.on("connect", () => {
            console.log("Order socket connected");
            setIsConnected(true);
        });

        newSocket.on("disconnect", () => {
            console.log("Order socket disconnected");
            setIsConnected(false);
        });

        newSocket.on("connect_error", (error) => {
            console.error("Order socket connection error:", error);
        });

        // Order event handlers
        newSocket.on("order:created", (event: OrderCreatedEvent) => {
            console.log("New order created:", event);

            // Invalidate and refetch orders list
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.count({}) });

            // Show notification
            if (enableNotifications) {
                toast.success(`Đơn hàng mới #${event.orderNumber} đã được tạo`);
            }

            // Play sound
            if (enableSound) {
                playNotificationSound();
            }

            // Custom callback
            if (onOrderCreated) {
                onOrderCreated(event);
            }
        });

        newSocket.on("order:updated", (event: OrderUpdatedEvent) => {
            console.log("Order updated:", event);

            // Invalidate queries
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(event.orderId),
            });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

            // Custom callback
            if (onOrderUpdated) {
                onOrderUpdated(event);
            }
        });

        newSocket.on("order:status-changed", (event: OrderUpdatedEvent) => {
            console.log("Order status changed:", event);

            // Invalidate queries
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(event.orderId),
            });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

            // Show notification
            if (enableNotifications) {
                toast.info(
                    `Đơn hàng #${event.orderNumber} chuyển sang trạng thái: ${event.status}`
                );
            }

            // Custom callback
            if (onOrderUpdated) {
                onOrderUpdated(event);
            }
        });

        newSocket.on("order:items-added", (event: OrderItemsAddedEvent) => {
            console.log("Items added to order:", event);

            // Invalidate queries
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(event.orderId),
            });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

            // Show notification
            if (enableNotifications) {
                toast.success(
                    `Đã thêm ${event.items.length} món vào đơn hàng #${event.orderNumber}`
                );
            }

            // Custom callback
            if (onItemsAdded) {
                onItemsAdded(event);
            }
        });

        newSocket.on(
            "order:item-cancelled",
            (event: OrderItemCancelledEvent) => {
                console.log("Order item cancelled:", event);

                // Invalidate queries
                queryClient.invalidateQueries({
                    queryKey: orderKeys.detail(event.orderId),
                });
                queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

                // Show notification
                if (enableNotifications) {
                    toast.warning(
                        `Món trong đơn hàng #${event.orderNumber} đã bị hủy`
                    );
                }

                // Custom callback
                if (onItemCancelled) {
                    onItemCancelled(event);
                }
            }
        );

        newSocket.on("order:cancelled", (event: OrderCancelledEvent) => {
            console.log("Order cancelled:", event);

            // Invalidate queries
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(event.orderId),
            });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.count({}) });

            // Show notification
            if (enableNotifications) {
                toast.error(`Đơn hàng #${event.orderNumber} đã bị hủy`);
            }

            // Custom callback
            if (onOrderCancelled) {
                onOrderCancelled(event);
            }
        });

        newSocket.on("kitchen:order-ready", (event: KitchenOrderReadyEvent) => {
            console.log("Kitchen order ready:", event);

            // Invalidate queries
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(event.orderId),
            });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

            // Show notification
            if (enableNotifications) {
                toast.success(
                    `Đơn hàng #${event.orderNumber} đã sẵn sàng để phục vụ! 🍽️`,
                    {
                        duration: 5000,
                    }
                );
            }

            // Play sound
            if (enableSound) {
                playNotificationSound();
            }

            // Custom callback
            if (onKitchenOrderReady) {
                onKitchenOrderReady(event);
            }
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            newSocket.close();
        };
    }, [
        queryClient,
        onOrderCreated,
        onOrderUpdated,
        onItemsAdded,
        onItemCancelled,
        onOrderCancelled,
        onKitchenOrderReady,
        enableNotifications,
        enableSound,
    ]);

    return {
        socket,
        isConnected,
    };
}

// Helper function to play notification sound
function playNotificationSound() {
    try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.volume = 0.5;
        audio.play().catch((error) => {
            console.warn("Failed to play notification sound:", error);
        });
    } catch (error) {
        console.warn("Notification sound not available:", error);
    }
}
