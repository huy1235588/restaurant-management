import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reservationApi } from "../services";
import type {
    Reservation,
    CreateReservationDto,
    UpdateReservationDto,
    ReservationFilters,
} from "../types";

export const reservationKeys = {
    all: ["reservations"] as const,
    lists: () => [...reservationKeys.all, "list"] as const,
    list: (filters: ReservationFilters & { page?: number; limit?: number }) =>
        [...reservationKeys.lists(), filters] as const,
    details: () => [...reservationKeys.all, "detail"] as const,
    detail: (id: number) => [...reservationKeys.details(), id] as const,
    availableTables: (params: {
        date: string;
        time: string;
        duration: number;
        partySize: number;
    }) => [...reservationKeys.all, "available-tables", params] as const,
};

export function useReservations(
    filters: ReservationFilters & { page?: number; limit?: number } = {}
) {
    return useQuery({
        queryKey: reservationKeys.list(filters),
        queryFn: () => reservationApi.getAll(filters),
        staleTime: 30000,
    });
}

export function useReservation(id: number) {
    return useQuery({
        queryKey: reservationKeys.detail(id),
        queryFn: () => reservationApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateReservation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateReservationDto) => reservationApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: reservationKeys.lists(),
            });
            toast.success("Reservation created successfully");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to create reservation"
            );
        },
    });
}

export function useUpdateReservation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: number;
            data: UpdateReservationDto;
        }) => reservationApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: reservationKeys.detail(variables.id),
            });
            queryClient.invalidateQueries({
                queryKey: reservationKeys.lists(),
            });
            toast.success("Reservation updated successfully");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to update reservation"
            );
        },
    });
}

export function useConfirmReservation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => reservationApi.confirm(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: reservationKeys.detail(id),
            });
            queryClient.invalidateQueries({
                queryKey: reservationKeys.lists(),
            });
            toast.success("Reservation confirmed");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to confirm reservation"
            );
        },
    });
}

export function useSeatCustomer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => reservationApi.seat(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: reservationKeys.detail(id),
            });
            queryClient.invalidateQueries({
                queryKey: reservationKeys.lists(),
            });
            toast.success("Customer seated");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to seat customer"
            );
        },
    });
}

export function useMarkNoShow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => reservationApi.noShow(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: reservationKeys.detail(id),
            });
            queryClient.invalidateQueries({
                queryKey: reservationKeys.lists(),
            });
            toast.success("Marked as no-show");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to mark no-show"
            );
        },
    });
}

export function useCancelReservation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => reservationApi.cancel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: reservationKeys.lists(),
            });
            toast.success("Reservation cancelled");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to cancel reservation"
            );
        },
    });
}

export function useAvailableTables(params: {
    date: string;
    time: string;
    duration: number;
    partySize: number;
}) {
    return useQuery({
        queryKey: reservationKeys.availableTables(params),
        queryFn: () => reservationApi.getAvailableTables(params),
        enabled: !!(params.date && params.time && params.partySize),
    });
}
