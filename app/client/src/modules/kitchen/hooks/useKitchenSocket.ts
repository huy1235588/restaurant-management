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

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
const MAX_RECONNECT_ATTEMPTS = 5;

export function useKitchenSocket() {
    const [isConnected, setIsConnected] = useState(false);
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const socketRef = useRef<Socket | null>(null);
    const queryClient = useQueryClient();
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Connect to /kitchen namespace
        const socket = io(`${SOCKET_URL}/kitchen`, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        });

        socketRef.current = socket;

        // Connection events
        socket.on("connect", () => {
            console.log("[Kitchen Socket] Connected");
            setIsConnected(true);
            setReconnectAttempts(0);

            // Clear any pending reconnect timeout
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        });

        socket.on("disconnect", (reason) => {
            console.log("[Kitchen Socket] Disconnected:", reason);
            setIsConnected(false);

            // Auto-reconnect with exponential backoff
            if (reason === "io server disconnect") {
                // Server initiated disconnect - try to reconnect
                attemptReconnect();
            }
        });

        socket.on("connect_error", (error) => {
            console.error("[Kitchen Socket] Connection error:", error);
            setIsConnected(false);
            attemptReconnect();
        });

        // Kitchen events
        socket.on(KitchenSocketEvents.NEW_ORDER, (data: NewOrderEvent) => {
            console.log("[Kitchen Socket] New order:", data.data);

            // Invalidate orders list to refetch
            queryClient.invalidateQueries({
                queryKey: kitchenQueryKeys.list(),
            });

            // Show notification
            toast.info(`New Order #${data.data.order.orderNumber}`, {
                description: `Table: ${data.data.order.table.name || "N/A"} - ${
                    data.data.order.orderItems.length
                } items`,
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

                // Invalidate both list and detail queries
                queryClient.invalidateQueries({
                    queryKey: kitchenQueryKeys.list(),
                });
                queryClient.invalidateQueries({
                    queryKey: kitchenQueryKeys.detail(data.data.kitchenOrderId),
                });
            }
        );

        socket.on(
            KitchenSocketEvents.ORDER_COMPLETED,
            (data: OrderCompletedEvent) => {
                console.log("[Kitchen Socket] Order completed:", data.data);

                // Invalidate queries
                queryClient.invalidateQueries({
                    queryKey: kitchenQueryKeys.list(),
                });
                queryClient.invalidateQueries({
                    queryKey: kitchenQueryKeys.detail(data.data.kitchenOrderId),
                });

                // Show success notification
                toast.success("Order Completed", {
                    description: `Order #${data.data.order.orderNumber} has been completed`,
                });
            }
        );

        // Cleanup on unmount
        return () => {
            console.log("[Kitchen Socket] Disconnecting...");

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [queryClient]);

    // Exponential backoff reconnect
    const attemptReconnect = () => {
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            toast.error("Connection Lost", {
                description:
                    "Unable to connect to kitchen display. Please refresh the page.",
            });
            return;
        }

        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        console.log(
            `[Kitchen Socket] Reconnecting in ${delay / 1000}s (attempt ${
                reconnectAttempts + 1
            }/${MAX_RECONNECT_ATTEMPTS})`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            socketRef.current?.connect();
        }, delay);
    };

    // Manual reconnect
    const reconnect = () => {
        if (socketRef.current) {
            setReconnectAttempts(0);
            socketRef.current.connect();
        }
    };

    return {
        isConnected,
        reconnect,
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
