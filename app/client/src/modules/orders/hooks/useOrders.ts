import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orderApi } from "../services";
import type {
    Order,
    OrderItem,
    CreateOrderDto,
    AddOrderItemDto,
    UpdateOrderItemDto,
    CancelOrderDto,
    OrderFilters,
} from "../types";

// Query keys
export const orderKeys = {
    all: ["orders"] as const,
    lists: () => [...orderKeys.all, "list"] as const,
    list: (filters: OrderFilters & { page?: number; limit?: number }) =>
        [...orderKeys.lists(), filters] as const,
    details: () => [...orderKeys.all, "detail"] as const,
    detail: (id: number) => [...orderKeys.details(), id] as const,
};

// Fetch orders list with filters
export function useOrders(
    filters: OrderFilters & { page?: number; limit?: number } = {}
) {
    return useQuery({
        queryKey: orderKeys.list(filters),
        queryFn: () => orderApi.getAll(filters),
        staleTime: 30000, // 30 seconds
    });
}

// Fetch single order by ID
export function useOrder(id: number) {
    return useQuery({
        queryKey: orderKeys.detail(id),
        queryFn: () => orderApi.getById(id),
        enabled: !!id,
        staleTime: 10000, // 10 seconds
    });
}

// Create new order
export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrderDto) => orderApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            toast.success("Order created successfully");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to create order"
            );
        },
    });
}

// Update order
export function useUpdateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: Partial<CreateOrderDto>;
        }) => orderApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(variables.id),
            });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            toast.success("Order updated successfully");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to update order"
            );
        },
    });
}

// Confirm order (send to kitchen)
export function useConfirmOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => orderApi.confirm(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            toast.success("Order confirmed and sent to kitchen");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to confirm order"
            );
        },
    });
}

// Cancel order
export function useCancelOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CancelOrderDto }) =>
            orderApi.cancel(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(variables.id),
            });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            toast.success("Order cancelled successfully");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to cancel order"
            );
        },
    });
}

// Add item to order
export function useAddOrderItem(orderId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddOrderItemDto) => orderApi.addItem(orderId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(orderId),
            });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            toast.success("Item added to order");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to add item");
        },
    });
}

// Update order item
export function useUpdateOrderItem(orderId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            itemId,
            data,
        }: {
            itemId: number;
            data: UpdateOrderItemDto;
        }) => orderApi.updateItem(orderId, itemId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(orderId),
            });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            toast.success("Item updated");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to update item"
            );
        },
    });
}

// Remove item from order
export function useRemoveOrderItem(orderId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (itemId: number) => orderApi.removeItem(orderId, itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(orderId),
            });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            toast.success("Item removed from order");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to remove item"
            );
        },
    });
}
