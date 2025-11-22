"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { KitchenOrder } from "../types";

const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export function useKitchenSocket() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(`${SOCKET_URL}/kitchen`, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        // Connection event handlers
        newSocket.on("connect", () => {
            console.log("Kitchen socket connected");
            setIsConnected(true);
        });

        newSocket.on("disconnect", () => {
            console.log("Kitchen socket disconnected");
            setIsConnected(false);
        });

        newSocket.on("connect_error", (error) => {
            console.error("Kitchen socket connection error:", error);
        });

        // Kitchen order events
        newSocket.on("order:new", (order: KitchenOrder) => {
            console.log("New kitchen order received:", order);

            // Invalidate and refetch kitchen orders
            queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });

            // Optional: Play notification sound
            playNotificationSound();
        });

        newSocket.on("order:update", (order: KitchenOrder) => {
            console.log("Kitchen order updated:", order);

            // Update specific order in cache
            queryClient.setQueryData(
                ["kitchen-order", order.kitchenOrderId],
                order
            );

            // Invalidate list to ensure consistency
            queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
        });

        newSocket.on("order:completed", (orderId: number) => {
            console.log("Kitchen order completed:", orderId);

            // Remove from cache or refetch
            queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
        });

        newSocket.on("order:cancelled", (orderId: number) => {
            console.log("Kitchen order cancelled:", orderId);

            // Remove from cache or refetch
            queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            newSocket.close();
        };
    }, [queryClient]);

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
