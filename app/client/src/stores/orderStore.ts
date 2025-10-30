import { create } from 'zustand';
import { Order, OrderStatus } from '@/types';

interface OrderState {
    orders: Order[];
    selectedOrder: Order | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setOrders: (orders: Order[]) => void;
    addOrder: (order: Order) => void;
    updateOrder: (orderId: number, updates: Partial<Order>) => void;
    updateOrderStatus: (orderId: number, status: OrderStatus) => void;
    removeOrder: (orderId: number) => void;
    setSelectedOrder: (order: Order | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    clearOrders: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
    orders: [],
    selectedOrder: null,
    isLoading: false,
    error: null,

    setOrders: (orders) => set({ orders, error: null }),

    addOrder: (order) =>
        set((state) => ({
            orders: [order, ...state.orders],
            error: null,
        })),

    updateOrder: (orderId, updates) =>
        set((state) => ({
            orders: state.orders.map((order) =>
                order.orderId === orderId ? { ...order, ...updates } : order
            ),
            selectedOrder:
                state.selectedOrder?.orderId === orderId
                    ? { ...state.selectedOrder, ...updates }
                    : state.selectedOrder,
            error: null,
        })),

    updateOrderStatus: (orderId, status) =>
        set((state) => ({
            orders: state.orders.map((order) =>
                order.orderId === orderId ? { ...order, status } : order
            ),
            selectedOrder:
                state.selectedOrder?.orderId === orderId
                    ? { ...state.selectedOrder, status }
                    : state.selectedOrder,
            error: null,
        })),

    removeOrder: (orderId) =>
        set((state) => ({
            orders: state.orders.filter((order) => order.orderId !== orderId),
            selectedOrder:
                state.selectedOrder?.orderId === orderId ? null : state.selectedOrder,
            error: null,
        })),

    setSelectedOrder: (order) => set({ selectedOrder: order }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error, isLoading: false }),

    clearOrders: () =>
        set({
            orders: [],
            selectedOrder: null,
            isLoading: false,
            error: null,
        }),
}));
