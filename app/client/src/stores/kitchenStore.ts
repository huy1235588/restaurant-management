import { create } from 'zustand';
import { KitchenOrder, KitchenOrderStatus } from '@/types/kitchen';

interface KitchenState {
    kitchenOrders: KitchenOrder[];
    selectedKitchenOrder: KitchenOrder | null;
    isLoading: boolean;
    error: string | null;
    // Filters
    statusFilter: KitchenOrderStatus | 'all';
    stationFilter: number | null;
    staffFilter: number | null;

    // Actions
    setKitchenOrders: (orders: KitchenOrder[]) => void;
    addKitchenOrder: (order: KitchenOrder) => void;
    updateKitchenOrder: (kitchenOrderId: number, updates: Partial<KitchenOrder>) => void;
    updateKitchenOrderStatus: (kitchenOrderId: number, status: KitchenOrderStatus) => void;
    removeKitchenOrder: (kitchenOrderId: number) => void;
    setSelectedKitchenOrder: (order: KitchenOrder | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    clearKitchenOrders: () => void;
    
    // Filters
    setStatusFilter: (status: KitchenOrderStatus | 'all') => void;
    setStationFilter: (stationId: number | null) => void;
    setStaffFilter: (staffId: number | null) => void;
    clearFilters: () => void;
}

export const useKitchenStore = create<KitchenState>((set) => ({
    kitchenOrders: [],
    selectedKitchenOrder: null,
    isLoading: false,
    error: null,
    statusFilter: 'all',
    stationFilter: null,
    staffFilter: null,

    setKitchenOrders: (orders) => set({ kitchenOrders: orders, error: null }),

    addKitchenOrder: (order) =>
        set((state) => ({
            kitchenOrders: [order, ...state.kitchenOrders],
            error: null,
        })),

    updateKitchenOrder: (kitchenOrderId, updates) =>
        set((state) => ({
            kitchenOrders: state.kitchenOrders.map((order) =>
                order.kitchenOrderId === kitchenOrderId ? { ...order, ...updates } : order
            ),
            selectedKitchenOrder:
                state.selectedKitchenOrder?.kitchenOrderId === kitchenOrderId
                    ? { ...state.selectedKitchenOrder, ...updates }
                    : state.selectedKitchenOrder,
            error: null,
        })),

    updateKitchenOrderStatus: (kitchenOrderId, status) =>
        set((state) => ({
            kitchenOrders: state.kitchenOrders.map((order) =>
                order.kitchenOrderId === kitchenOrderId ? { ...order, status } : order
            ),
            selectedKitchenOrder:
                state.selectedKitchenOrder?.kitchenOrderId === kitchenOrderId
                    ? { ...state.selectedKitchenOrder, status }
                    : state.selectedKitchenOrder,
            error: null,
        })),

    removeKitchenOrder: (kitchenOrderId) =>
        set((state) => ({
            kitchenOrders: state.kitchenOrders.filter((order) => order.kitchenOrderId !== kitchenOrderId),
            selectedKitchenOrder:
                state.selectedKitchenOrder?.kitchenOrderId === kitchenOrderId ? null : state.selectedKitchenOrder,
            error: null,
        })),

    setSelectedKitchenOrder: (order) => set({ selectedKitchenOrder: order }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error, isLoading: false }),

    clearKitchenOrders: () =>
        set({
            kitchenOrders: [],
            selectedKitchenOrder: null,
            isLoading: false,
            error: null,
        }),

    // Filters
    setStatusFilter: (status) => set({ statusFilter: status }),
    
    setStationFilter: (stationId) => set({ stationFilter: stationId }),
    
    setStaffFilter: (staffId) => set({ staffFilter: staffId }),
    
    clearFilters: () => set({ 
        statusFilter: 'all',
        stationFilter: null,
        staffFilter: null,
    }),
}));
