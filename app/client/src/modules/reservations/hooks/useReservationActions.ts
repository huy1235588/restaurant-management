import { useState } from 'react';
import { reservationApi } from '../services/reservation.service';
import { CreateReservationDto, UpdateReservationDto, CancelReservationDto } from '../types';
import { toast } from 'sonner';

// Hook for reservation mutations (create, update, cancel, etc.)
export function useReservationActions() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createReservation = async (data: CreateReservationDto) => {
        try {
            setLoading(true);
            setError(null);
            const reservation = await reservationApi.create(data);
            toast.success(`Reservation created: ${reservation.reservationCode}`);
            return reservation;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to create reservation';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateReservation = async (id: number, data: UpdateReservationDto) => {
        try {
            setLoading(true);
            setError(null);
            const reservation = await reservationApi.update(id, data);
            toast.success('Reservation updated successfully');
            return reservation;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to update reservation';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const confirmReservation = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const reservation = await reservationApi.confirm(id);
            toast.success('Reservation confirmed');
            return reservation;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to confirm reservation';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const seatReservation = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const reservation = await reservationApi.seat(id);
            toast.success('Customer checked in');
            return reservation;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to check in';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const completeReservation = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const reservation = await reservationApi.complete(id);
            toast.success('Reservation completed');
            return reservation;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to complete reservation';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const cancelReservation = async (id: number, data?: CancelReservationDto) => {
        try {
            setLoading(true);
            setError(null);
            const reservation = await reservationApi.cancel(id, data);
            toast.success('Reservation cancelled');
            return reservation;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to cancel reservation';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const markNoShow = async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const reservation = await reservationApi.markNoShow(id);
            toast.success('Marked as no-show');
            return reservation;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to mark no-show';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        createReservation,
        updateReservation,
        confirmReservation,
        seatReservation,
        completeReservation,
        cancelReservation,
        markNoShow,
        loading,
        error,
    };
}
