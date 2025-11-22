import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, kitchenApi } from '../services';
import {
    Order,
    CreateOrderDto,
    AddItemsDto,
    CancelItemDto,
    CancelOrderDto,
    UpdateOrderStatusDto,
    OrderFilters,
    OrderListResponse,
    KitchenOrder,
} from '../types';
import { toast } from 'sonner';

// Query keys
export const orderKeys = {
    all: ['orders'] as const,
    lists: () => [...orderKeys.all, 'list'] as const,
    list: (filters?: OrderFilters) => [...orderKeys.lists(), { filters }] as const,
    details: () => [...orderKeys.all, 'detail'] as const,
    detail: (id: number) => [...orderKeys.details(), id] as const,
    count: (filters?: OrderFilters) => [...orderKeys.all, 'count', { filters }] as const,
    kitchen: () => [...orderKeys.all, 'kitchen'] as const,
    kitchenQueue: () => [...orderKeys.kitchen(), 'queue'] as const,
};

// Hook to fetch orders with pagination
export const useOrders = (params?: {
    page?: number;
    limit?: number;
    status?: string;
    tableId?: number;
    staffId?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}) => {
    return useQuery<OrderListResponse>({
        queryKey: orderKeys.list(params as OrderFilters),
        queryFn: () => orderApi.getAll(params),
    });
};

// Hook to fetch single order
export const useOrder = (id: number, enabled = true) => {
    return useQuery<Order>({
        queryKey: orderKeys.detail(id),
        queryFn: () => orderApi.getById(id),
        enabled,
    });
};

// Hook to count orders
export const useOrderCount = (filters?: OrderFilters) => {
    return useQuery<number>({
        queryKey: orderKeys.count(filters),
        queryFn: () => orderApi.count(filters),
    });
};

// Hook to create new order
export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrderDto) => orderApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.count() });
            toast.success('Đơn hàng đã được tạo thành công');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Tạo đơn hàng thất bại');
        },
    });
};

// Hook to add items to order
export const useAddItems = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, data }: { orderId: number; data: AddItemsDto }) =>
            orderApi.addItems(orderId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.kitchenQueue() });
            toast.success('Đã thêm món vào đơn hàng');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Thêm món thất bại');
        },
    });
};

// Hook to cancel item
export const useCancelItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            orderId,
            itemId,
            data,
        }: {
            orderId: number;
            itemId: number;
            data: CancelItemDto;
        }) => orderApi.cancelItem(orderId, itemId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.kitchenQueue() });
            toast.success('Đã hủy món');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Hủy món thất bại');
        },
    });
};

// Hook to cancel order
export const useCancelOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, data }: { orderId: number; data: CancelOrderDto }) =>
            orderApi.cancel(orderId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.count() });
            queryClient.invalidateQueries({ queryKey: orderKeys.kitchenQueue() });
            toast.success('Đã hủy đơn hàng');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Hủy đơn hàng thất bại');
        },
    });
};

// Hook to update order status
export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, data }: { orderId: number; data: UpdateOrderStatusDto }) =>
            orderApi.updateStatus(orderId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            toast.success('Đã cập nhật trạng thái đơn hàng');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại');
        },
    });
};

// Hook to mark item as served
export const useMarkItemAsServed = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, itemId }: { orderId: number; itemId: number }) =>
            orderApi.markItemAsServed(orderId, itemId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            toast.success('Đã đánh dấu món đã phục vụ');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Đánh dấu phục vụ thất bại');
        },
    });
};

// Hook to fetch kitchen queue
export const useKitchenQueue = () => {
    return useQuery<KitchenOrder[]>({
        queryKey: orderKeys.kitchenQueue(),
        queryFn: () => kitchenApi.getQueue(),
        refetchInterval: 5000, // Auto-refresh every 5 seconds
    });
};

// Hook to mark kitchen order as ready
export const useMarkKitchenOrderReady = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (kitchenOrderId: number) => kitchenApi.markAsReady(kitchenOrderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.kitchenQueue() });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            toast.success('Món đã sẵn sàng phục vụ');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Đánh dấu sẵn sàng thất bại');
        },
    });
};
