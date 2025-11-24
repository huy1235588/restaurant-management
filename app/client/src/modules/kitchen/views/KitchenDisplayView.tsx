"use client";

import { useState, useEffect, useMemo } from "react";
import { RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useKitchenOrders } from "../hooks/useKitchenOrders";
import { useKitchenSocket } from "../hooks/useKitchenSocket";
import { useStartPreparing } from "../hooks/useStartPreparing";
import { useCompleteOrder } from "../hooks/useCompleteOrder";
import { useCancelKitchenOrder } from "../hooks/useCancelKitchenOrder";
import {
    KitchenOrderStatus,
} from "../types/kitchen.types";
import { KitchenOrderCard } from "../components/KitchenOrderCard";
import { KitchenStats } from "../components/KitchenStats";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import { KitchenHelpers } from "../utils/kitchen-helpers";

export function KitchenDisplayView() {
    const [statusFilter, setStatusFilter] = useState<
        KitchenOrderStatus | "all"
    >("all");
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Queries
    const { data: orders, isLoading, isError, refetch } = useKitchenOrders();

    // WebSocket connection
    const { isConnected } = useKitchenSocket();

    // Mutations
    const startPreparingMutation = useStartPreparing();
    const completeOrderMutation = useCompleteOrder();
    const cancelMutation = useCancelKitchenOrder();

    // Filter and sort orders by creation time (oldest first)
    const filteredOrders = useMemo(() => {
        if (!orders) return [];

        return KitchenHelpers.sortOrdersByTime(
            KitchenHelpers.filterOrdersByStatus(orders, statusFilter)
        );
    }, [orders, statusFilter]);

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

    // Current time display
    const [currentTime, setCurrentTime] = useState(
        new Date().toLocaleTimeString()
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Action handlers
    const handleStartPreparing = (orderId: number) => {
        startPreparingMutation.mutate(orderId);
    };

    const handleCompleteOrder = (orderId: number) => {
        completeOrderMutation.mutate(orderId);
    };

    const handleCancel = (orderId: number) => {
        cancelMutation.mutate(orderId);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header - Hidden in fullscreen */}
            {!isFullscreen && (
                <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                        <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                            Kitchen Display
                        </h1>

                        {/* Connection Status */}
                        <div className="flex items-center gap-1 md:gap-2">
                            <div
                                className={`w-2 h-2 rounded-full ${isConnected
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-red-500"
                                    }`}
                            />
                            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                                {isConnected ? "Connected" : "Disconnected"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Current Time */}
                        <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:inline">
                            {currentTime}
                        </span>

                        {/* Refresh Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            disabled={isLoading}
                            className="h-8 md:h-9 px-2 md:px-3"
                        >
                            <RefreshCw
                                className={`h-3 w-3 md:h-4 md:w-4 ${isLoading ? "animate-spin" : ""
                                    }`}
                            />
                            <span className="ml-1 md:ml-2 hidden sm:inline">Refresh</span>
                        </Button>

                        {/* Fullscreen Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleFullscreen}
                            className="h-8 md:h-9 px-2 md:px-3"
                        >
                            {isFullscreen ? (
                                <Minimize2 className="h-3 w-3 md:h-4 md:w-4" />
                            ) : (
                                <Maximize2 className="h-3 w-3 md:h-4 md:w-4" />
                            )}
                            <span className="ml-1 md:ml-2 hidden sm:inline">
                                {isFullscreen ? "Exit" : "Fullscreen"}
                            </span>
                        </Button>
                    </div>
                </div>
            )}

            {/* Stats Section */}
            <div className="px-3 md:px-4 py-2 md:py-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <KitchenStats orders={orders} />
            </div>

            {/* Fullscreen Floating Controls */}
            {isFullscreen && (
                <div className="absolute top-2 right-2 z-50 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-2 h-2 rounded-full ${isConnected
                                ? "bg-green-500 animate-pulse"
                                : "bg-red-500"
                                }`}
                        />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {currentTime}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="h-7 px-2"
                    >
                        <RefreshCw
                            className={`h-3 w-3 ${isLoading ? "animate-spin" : ""
                                }`}
                        />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="h-7 px-2"
                    >
                        <Minimize2 className="h-3 w-3" />
                    </Button>
                </div>
            )}

            {/* Filter Bar */}
            <div className="px-3 md:px-4 py-2 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                    {/* Status Filters */}
                    <div className="flex gap-1 md:gap-2">
                        <Button
                            variant={statusFilter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("all")}
                            className="h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
                        >
                            All
                        </Button>
                        <Button
                            variant={
                                statusFilter === KitchenOrderStatus.PENDING
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() =>
                                setStatusFilter(KitchenOrderStatus.PENDING)
                            }
                            className="h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
                        >
                            Pending
                        </Button>
                        <Button
                            variant={
                                statusFilter === KitchenOrderStatus.PREPARING
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() => setStatusFilter(KitchenOrderStatus.PREPARING)}
                            className="h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
                        >
                            Preparing
                        </Button>
                        <Button
                            variant={
                                statusFilter === KitchenOrderStatus.COMPLETED
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() =>
                                setStatusFilter(KitchenOrderStatus.COMPLETED)
                            }
                            className="h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
                        >
                            Completed
                        </Button>
                    </div>
                </div>
            </div>

            {/* Orders Grid */}
            <div className="flex-1 overflow-auto p-3 md:p-4">
                {isLoading && <LoadingState />}

                {isError && (
                    <ErrorState
                        message="Failed to load kitchen orders"
                        onRetry={() => refetch()}
                    />
                )}

                {!isLoading && !isError && filteredOrders.length === 0 && (
                    <EmptyState />
                )}

                {!isLoading && !isError && filteredOrders.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                        {filteredOrders.map((order) => (
                            <KitchenOrderCard
                                key={order.kitchenOrderId}
                                order={order}
                                onStartPreparing={handleStartPreparing}
                                onCompleteOrder={handleCompleteOrder}
                                onCancel={handleCancel}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
