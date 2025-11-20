import { create } from 'zustand';
import {
    Reservation,
    ReservationStatus,
    CreateReservationDto,
    UpdateReservationDto,
    Customer,
    AvailabilityCheck,
} from '@/types';
import { reservationApi } from '@/modules/reservations/services';
import { toast } from 'sonner';

export type ViewMode = 'calendar' | 'timeline' | 'list';

interface ReservationFilters {
    status?: ReservationStatus[];
    floor?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
}

interface ReservationStore {
    // State
    reservations: Reservation[];
    selectedReservation: Reservation | null;
    customers: Customer[];
    selectedDate: Date;
    viewMode: ViewMode;
    filters: ReservationFilters;
    isLoading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };

    // Actions - Reservations
    fetchReservations: (params?: {
        date?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }) => Promise<void>;
    fetchReservationById: (id: number) => Promise<void>;
    createReservation: (data: CreateReservationDto) => Promise<Reservation | null>;
    updateReservation: (id: number, data: UpdateReservationDto) => Promise<Reservation | null>;
    deleteReservation: (id: number) => Promise<boolean>;
    cancelReservation: (id: number, reason?: string) => Promise<boolean>;
    confirmReservation: (id: number) => Promise<boolean>;
    markAsSeated: (id: number) => Promise<boolean>;
    markAsCompleted: (id: number) => Promise<boolean>;
    markAsNoShow: (id: number) => Promise<boolean>;
    checkAvailability: (params: {
        date: string;
        time: string;
        partySize: number;
        duration?: number;
        floor?: number;
        tableId?: number;
    }) => Promise<AvailabilityCheck | null>;

    // Actions - Customers
    fetchCustomers: (search?: string) => Promise<void>;
    searchCustomers: (query: string) => Promise<Customer[]>;

    // Actions - UI State
    setSelectedReservation: (reservation: Reservation | null) => void;
    setSelectedDate: (date: Date) => void;
    setViewMode: (mode: ViewMode) => void;
    setFilters: (filters: Partial<ReservationFilters>) => void;
    clearFilters: () => void;
    setPage: (page: number) => void;
    clearError: () => void;
}

export const useReservationStore = create<ReservationStore>((set, get) => ({
    // Initial State
    reservations: [],
    selectedReservation: null,
    customers: [],
    selectedDate: new Date(),
    viewMode: 'calendar',
    filters: {},
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    },

    // ========== Reservation Actions ==========

    fetchReservations: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const { filters, pagination } = get();
            const response = await reservationApi.getAll({
                ...params,
                status: filters.status,
                floor: filters.floor,
                search: filters.search,
                page: params?.page || pagination.page,
                limit: params?.limit || pagination.limit,
            });

            set({
                reservations: response.items,
                pagination: response.pagination,
                isLoading: false,
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch reservations';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
        }
    },

    fetchReservationById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const reservation = await reservationApi.getById(id);
            set({
                selectedReservation: reservation,
                isLoading: false,
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch reservation';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
        }
    },

    createReservation: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const reservation = await reservationApi.create(data);
            
            // Add to list if in current view
            const { reservations } = get();
            set({
                reservations: [reservation, ...reservations],
                isLoading: false,
            });
            
            toast.success('Reservation created successfully');
            return reservation;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to create reservation';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return null;
        }
    },

    updateReservation: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const updatedReservation = await reservationApi.update(id, data);
            
            // Update in list
            const { reservations } = get();
            set({
                reservations: reservations.map(r => 
                    r.reservationId === id ? updatedReservation : r
                ),
                selectedReservation: updatedReservation,
                isLoading: false,
            });
            
            toast.success('Reservation updated successfully');
            return updatedReservation;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update reservation';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return null;
        }
    },

    deleteReservation: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await reservationApi.delete(id);
            
            // Remove from list
            const { reservations } = get();
            set({
                reservations: reservations.filter(r => r.reservationId !== id),
                isLoading: false,
            });
            
            toast.success('Reservation deleted successfully');
            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to delete reservation';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
        }
    },

    cancelReservation: async (id, reason) => {
        set({ isLoading: true, error: null });
        try {
            const updatedReservation = await reservationApi.cancel(id, reason);
            
            // Update in list
            const { reservations } = get();
            set({
                reservations: reservations.map(r => 
                    r.reservationId === id ? updatedReservation : r
                ),
                selectedReservation: updatedReservation,
                isLoading: false,
            });
            
            toast.success('Reservation cancelled successfully');
            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to cancel reservation';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
        }
    },

    confirmReservation: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const updatedReservation = await reservationApi.confirm(id);
            
            // Update in list
            const { reservations } = get();
            set({
                reservations: reservations.map(r => 
                    r.reservationId === id ? updatedReservation : r
                ),
                selectedReservation: updatedReservation,
                isLoading: false,
            });
            
            toast.success('Reservation confirmed successfully');
            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to confirm reservation';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
        }
    },

    markAsSeated: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const updatedReservation = await reservationApi.markAsSeated(id);
            
            // Update in list
            const { reservations } = get();
            set({
                reservations: reservations.map(r => 
                    r.reservationId === id ? updatedReservation : r
                ),
                selectedReservation: updatedReservation,
                isLoading: false,
            });
            
            toast.success('Reservation marked as seated');
            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to mark as seated';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
        }
    },

    markAsCompleted: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const updatedReservation = await reservationApi.markAsCompleted(id);
            
            // Update in list
            const { reservations } = get();
            set({
                reservations: reservations.map(r => 
                    r.reservationId === id ? updatedReservation : r
                ),
                selectedReservation: updatedReservation,
                isLoading: false,
            });
            
            toast.success('Reservation completed');
            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to mark as completed';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
        }
    },

    markAsNoShow: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const updatedReservation = await reservationApi.markAsNoShow(id);
            
            // Update in list
            const { reservations } = get();
            set({
                reservations: reservations.map(r => 
                    r.reservationId === id ? updatedReservation : r
                ),
                selectedReservation: updatedReservation,
                isLoading: false,
            });
            
            toast.success('Reservation marked as no-show');
            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to mark as no-show';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return false;
        }
    },

    checkAvailability: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const availability = await reservationApi.checkAvailability(params);
            set({ isLoading: false });
            return availability;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to check availability';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return null;
        }
    },

    // ========== Customer Actions ==========

    fetchCustomers: async (search) => {
        set({ isLoading: true, error: null });
        try {
            const response = await reservationApi.getAllCustomers({
                search,
                limit: 50,
            });
            
            set({
                customers: response.items,
                isLoading: false,
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch customers';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
        }
    },

    searchCustomers: async (query) => {
        try {
            const customers = await reservationApi.searchCustomers(query);
            return customers;
        } catch (error: any) {
            toast.error('Failed to search customers');
            return [];
        }
    },

    // ========== UI State Actions ==========

    setSelectedReservation: (reservation) => {
        set({ selectedReservation: reservation });
    },

    setSelectedDate: (date) => {
        set({ selectedDate: date });
    },

    setViewMode: (mode) => {
        set({ viewMode: mode });
    },

    setFilters: (filters) => {
        set((state) => ({
            filters: { ...state.filters, ...filters },
            pagination: { ...state.pagination, page: 1 }, // Reset to page 1
        }));
    },

    clearFilters: () => {
        set({
            filters: {},
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        });
    },

    setPage: (page) => {
        set((state) => ({
            pagination: { ...state.pagination, page },
        }));
    },

    clearError: () => {
        set({ error: null });
    },
}));
