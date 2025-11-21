import { useState } from 'react';
import { useReservations } from '../hooks/useReservations';
import { ReservationList, ReservationFilters } from '../components';
import {
    CreateReservationDialog,
    ConfirmReservationDialog,
    CancelReservationDialog,
    CheckInDialog,
    CompleteReservationDialog,
    NoShowDialog,
} from '../dialogs';
import { Reservation, ReservationFilterOptions as FilterType } from '../types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ReservationListView() {
    const router = useRouter();
    const [filters, setFilters] = useState<FilterType>({
        page: 1,
        limit: 12,
    });

    const { reservations, pagination, loading, refetch } = useReservations(filters);

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showCheckInDialog, setShowCheckInDialog] = useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [showNoShowDialog, setShowNoShowDialog] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

    const handleFilterChange = (newFilters: Partial<FilterType>) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handleReservationClick = (reservation: Reservation) => {
        router.push(`/reservations/${reservation.reservationId}`);
    };

    const handleConfirm = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setShowConfirmDialog(true);
    };

    const handleCancel = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setShowCancelDialog(true);
    };

    const handleCheckIn = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setShowCheckInDialog(true);
    };

    const handleSuccess = () => {
        refetch();
    };

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
                    <p className="text-gray-500 mt-1">Manage restaurant reservations</p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Reservation
                </Button>
            </div>

            {/* Filters */}
            <ReservationFilters onFilterChange={handleFilterChange} />

            {/* List */}
            <ReservationList
                reservations={reservations}
                loading={loading}
                onReservationClick={handleReservationClick}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                onCheckIn={handleCheckIn}
                showActions
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Dialogs */}
            <CreateReservationDialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onSuccess={handleSuccess}
            />
            <ConfirmReservationDialog
                open={showConfirmDialog}
                reservation={selectedReservation}
                onClose={() => setShowConfirmDialog(false)}
                onSuccess={handleSuccess}
            />
            <CancelReservationDialog
                open={showCancelDialog}
                reservation={selectedReservation}
                onClose={() => setShowCancelDialog(false)}
                onSuccess={handleSuccess}
            />
            <CheckInDialog
                open={showCheckInDialog}
                reservation={selectedReservation}
                onClose={() => setShowCheckInDialog(false)}
                onSuccess={handleSuccess}
            />
            <CompleteReservationDialog
                open={showCompleteDialog}
                reservation={selectedReservation}
                onClose={() => setShowCompleteDialog(false)}
                onSuccess={handleSuccess}
            />
            <NoShowDialog
                open={showNoShowDialog}
                reservation={selectedReservation}
                onClose={() => setShowNoShowDialog(false)}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
