"use client";

import { useEffect, useState, useRef } from "react";
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
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
const ORDER_NAMESPACE = "/orders";

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

// Singleton socket instance - shared across all components
let globalSocket: Socket | null = null;
let socketRefCount = 0;

function getOrCreateSocket(): Socket {
    if (!globalSocket) {
        console.log("[OrderSocket] Creating new socket instance");
        globalSocket = io(`${SOCKET_URL}${ORDER_NAMESPACE}`, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        globalSocket.on("connect", () => {
            console.log("[OrderSocket] Connected");
        });

        globalSocket.on("disconnect", () => {
            console.log("[OrderSocket] Disconnected");
        });

        globalSocket.on("connect_error", (error) => {
            console.error("[OrderSocket] Connection error:", error);
        });
    }
    return globalSocket;
}

function cleanupSocket() {
    if (globalSocket && socketRefCount === 0) {
        console.log("[OrderSocket] Cleaning up socket instance");
        globalSocket.close();
        globalSocket = null;
    }
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

    const [isConnected, setIsConnected] = useState(false);
    const queryClient = useQueryClient();
    const socketRef = useRef<Socket | null>(null);
    const handlersRegistered = useRef(false);

    useEffect(() => {
        // Get or create shared socket instance
        const socket = getOrCreateSocket();
        socketRef.current = socket;
        socketRefCount++;

        console.log(
            `[OrderSocket] Component mounted (refCount: ${socketRefCount})`
        );

        // Update connection status
        setIsConnected(socket.connected);

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        // Register event handlers only once per component instance
        if (!handlersRegistered.current) {
            handlersRegistered.current = true;

            // Order event handlers
            const handleOrderCreated = (event: OrderCreatedEvent) => {
                console.log("[OrderSocket] New order created:", event);

                // Invalidate and refetch orders list
                queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
                queryClient.invalidateQueries({
                    queryKey: orderKeys.count({}),
                });

                // Show notification
                if (enableNotifications) {
                    toast.success(
                        `Đơn hàng mới #${event.orderNumber} đã được tạo`
                    );
                }

                // Play sound
                if (enableSound) {
                    playNotificationSound();
                }

                // Custom callback
                if (onOrderCreated) {
                    onOrderCreated(event);
                }
            };

            const handleOrderUpdated = (event: OrderUpdatedEvent) => {
                console.log("[OrderSocket] Order updated:", event);

                // Invalidate queries
                queryClient.invalidateQueries({
                    queryKey: orderKeys.detail(event.orderId),
                });
                queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

                // Custom callback
                if (onOrderUpdated) {
                    onOrderUpdated(event);
                }
            };

            const handleStatusChanged = (event: OrderUpdatedEvent) => {
                console.log("[OrderSocket] Order status changed:", event);

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
            };

            const handleItemsAdded = (event: OrderItemsAddedEvent) => {
                console.log("[OrderSocket] Items added to order:", event);

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
            };

            const handleItemCancelled = (event: OrderItemCancelledEvent) => {
                console.log("[OrderSocket] Order item cancelled:", event);

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
            };

            const handleOrderCancelled = (event: OrderCancelledEvent) => {
                console.log("[OrderSocket] Order cancelled:", event);

                // Invalidate queries
                queryClient.invalidateQueries({
                    queryKey: orderKeys.detail(event.orderId),
                });
                queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
                queryClient.invalidateQueries({
                    queryKey: orderKeys.count({}),
                });

                // Show notification
                if (enableNotifications) {
                    toast.error(`Đơn hàng #${event.orderNumber} đã bị hủy`);
                }

                // Custom callback
                if (onOrderCancelled) {
                    onOrderCancelled(event);
                }
            };

            const handleKitchenReady = (event: KitchenOrderReadyEvent) => {
                console.log("[OrderSocket] Kitchen order ready:", event);

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
            };

            socket.on("order:created", handleOrderCreated);
            socket.on("order:updated", handleOrderUpdated);
            socket.on("order:status-changed", handleStatusChanged);
            socket.on("order:items-added", handleItemsAdded);
            socket.on("order:item-cancelled", handleItemCancelled);
            socket.on("order:cancelled", handleOrderCancelled);
            socket.on("kitchen:order-ready", handleKitchenReady);

            // Store cleanup function
            return () => {
                socket.off("order:created", handleOrderCreated);
                socket.off("order:updated", handleOrderUpdated);
                socket.off("order:status-changed", handleStatusChanged);
                socket.off("order:items-added", handleItemsAdded);
                socket.off("order:item-cancelled", handleItemCancelled);
                socket.off("order:cancelled", handleOrderCancelled);
                socket.off("kitchen:order-ready", handleKitchenReady);
            };
        }

        // Cleanup on unmount
        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);

            socketRefCount--;
            console.log(
                `[OrderSocket] Component unmounted (refCount: ${socketRefCount})`
            );

            // Only close socket when no components are using it
            // Use a small delay to prevent reconnection when navigating between pages
            setTimeout(() => {
                cleanupSocket();
            }, 1000);
        };
    }, []); // Empty deps - socket persists across component lifecycle

    return {
        socket: socketRef.current,
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
