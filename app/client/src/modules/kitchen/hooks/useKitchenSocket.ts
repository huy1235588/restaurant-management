"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    KitchenSocketEvents,
    NewOrderEvent,
    OrderUpdateEvent,
    OrderCompletedEvent,
} from "../types/kitchen.types";
import { KITCHEN_CONFIG } from "../constants/kitchen.constants";
import { kitchenQueryKeys } from "../utils/kitchen-query-keys";
import { KitchenHelpers } from "../utils/kitchen-helpers";

// Default to empty so socket.io connects to same-origin via the proxy.
// If you need a custom socket host, set `NEXT_PUBLIC_SOCKET_URL`.
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "";
const KITCHEN_NAMESPACE = "/kitchen";
const MAX_RECONNECT_ATTEMPTS = 5;
const DEBOUNCE_DELAY = 500; // Debounce query invalidation by 500ms

// Singleton socket instance - shared across all components
let globalSocket: Socket | null = null;
let socketRefCount = 0;

// Debounced invalidation tracker
let invalidationTimer: NodeJS.Timeout | null = null;

function getOrCreateSocket(): Socket {
    if (!globalSocket) {
        console.log("[KitchenSocket] Creating new socket instance");
        globalSocket = io(`${SOCKET_URL}${KITCHEN_NAMESPACE}`, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        });

        globalSocket.on("connect", () => {
            console.log("[KitchenSocket] Connected");
        });

        globalSocket.on("disconnect", () => {
            console.log("[KitchenSocket] Disconnected");
        });

        globalSocket.on("connect_error", (error) => {
            console.error("[KitchenSocket] Connection error:", error);
        });
    }
    return globalSocket;
}

function cleanupSocket() {
    if (globalSocket && socketRefCount === 0) {
        console.log("[KitchenSocket] Cleaning up socket instance");
        globalSocket.close();
        globalSocket = null;
    }
}

// Debounced query invalidation helper
function debouncedInvalidateQueries(
    queryClient: ReturnType<typeof useQueryClient>,
    queryKey: readonly unknown[]
) {
    if (invalidationTimer) {
        clearTimeout(invalidationTimer);
    }

    invalidationTimer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: queryKey as unknown[] });
        invalidationTimer = null;
    }, DEBOUNCE_DELAY);
}

export function useKitchenSocket() {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const queryClient = useQueryClient();
    const handlersRegistered = useRef(false);

    useEffect(() => {
        // Get or create shared socket instance
        const socket = getOrCreateSocket();
        socketRef.current = socket;
        socketRefCount++;

        console.log(
            `[KitchenSocket] Component mounted (refCount: ${socketRefCount})`
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
            socket.on(KitchenSocketEvents.NEW_ORDER, (data: NewOrderEvent) => {
                console.log("[Kitchen Socket] New order:", data.data);

                // Debounced invalidation for better performance
                debouncedInvalidateQueries(
                    queryClient,
                    kitchenQueryKeys.list()
                );

                // Show notification
                const tableName = KitchenHelpers.getTableDisplayName(
                    data.data.order.table
                );
                toast.info(`New Order #${data.data.order.orderNumber}`, {
                    description: `Table: ${tableName} - ${data.data.order.orderItems.length} items`,
                });

                // Play audio notification (if audio system is implemented)
                if (KITCHEN_CONFIG.AUDIO_ENABLED) {
                    playNewOrderSound();
                }
            });

            socket.on(
                KitchenSocketEvents.ORDER_UPDATED,
                (data: OrderUpdateEvent) => {
                    console.log("[Kitchen Socket] Order updated:", data.data);

                    // Debounced invalidation for list
                    debouncedInvalidateQueries(
                        queryClient,
                        kitchenQueryKeys.list()
                    );

                    // Immediate invalidation for detail view
                    queryClient.invalidateQueries({
                        queryKey: kitchenQueryKeys.detail(
                            data.data.kitchenOrderId
                        ),
                    });

                    // Show notification for order updates (e.g., items added)
                    toast.info("Order Updated", {
                        description: `Order #${
                            data.data.order?.orderNumber || ""
                        } has been updated`,
                    });
                }
            );

            socket.on(
                KitchenSocketEvents.ORDER_COMPLETED,
                (data: OrderCompletedEvent) => {
                    console.log("[Kitchen Socket] Order completed:", data.data);

                    // Debounced invalidation for list
                    debouncedInvalidateQueries(
                        queryClient,
                        kitchenQueryKeys.list()
                    );

                    // Immediate invalidation for detail view
                    queryClient.invalidateQueries({
                        queryKey: kitchenQueryKeys.detail(
                            data.data.kitchenOrderId
                        ),
                    });

                    // Show success notification
                    toast.success("Order Completed", {
                        description: `Order #${data.data.order.orderNumber} has been completed`,
                    });
                }
            );

            // Listen to order cancellation from Order namespace
            socket.on("order:cancelled", (data: any) => {
                console.log("[Kitchen Socket] Order cancelled:", data);

                // Event data is wrapped: { event, data, timestamp }
                const eventData = data.data || data;

                // Invalidate kitchen orders to remove cancelled order from list
                debouncedInvalidateQueries(
                    queryClient,
                    kitchenQueryKeys.list()
                );

                // Show notification
                toast.warning("Order Cancelled", {
                    description: `Order #${
                        eventData.orderNumber || ""
                    } has been cancelled`,
                });
            });

            // Listen to kitchen-specific order cancelled event
            socket.on("kitchen:order-cancelled", (data: any) => {
                console.log("[Kitchen Socket] Kitchen order cancelled:", data);

                // Event data is wrapped: { event, data, timestamp }
                const eventData = data.data || data;

                // Invalidate kitchen orders to remove cancelled order from list
                debouncedInvalidateQueries(
                    queryClient,
                    kitchenQueryKeys.list()
                );

                // Show notification
                toast.warning("Order Cancelled", {
                    description: `Order #${
                        eventData.orderNumber || ""
                    } has been cancelled`,
                });
            });

            // Store cleanup function for event handlers
            return () => {
                socket.off(KitchenSocketEvents.NEW_ORDER);
                socket.off(KitchenSocketEvents.ORDER_UPDATED);
                socket.off(KitchenSocketEvents.ORDER_COMPLETED);
                socket.off("order:cancelled");
                socket.off("kitchen:order-cancelled");
            };
        }

        // Cleanup on unmount
        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);

            socketRefCount--;
            console.log(
                `[KitchenSocket] Component unmounted (refCount: ${socketRefCount})`
            );

            // Only close socket when no components are using it
            setTimeout(() => {
                cleanupSocket();
            }, 1000);
        };
    }, []); // Empty deps - socket persists across component lifecycle

    return {
        isConnected,
        socket: socketRef.current,
    };
}

// Helper function to play new order sound
function playNewOrderSound() {
    try {
        const audio = new Audio(KITCHEN_CONFIG.SOUND_URLS.newOrder);
        audio.volume = 0.5;
        audio.play().catch((err) => {
            console.warn("[Kitchen Socket] Failed to play sound:", err);
        });
    } catch (error) {
        console.warn("[Kitchen Socket] Audio not supported:", error);
    }
}
