import { useState, useEffect } from 'react';
import { useReservations } from '../hooks/useReservations';
import { ReservationList, ReservationFilters } from '../components';
import {
    ConfirmReservationDialog,
    CancelReservationDialog,
    CheckInDialog,
    CompleteReservationDialog,
    NoShowDialog,
} from '../dialogs';
import { Reservation, ReservationFilterOptions as FilterType } from '../types';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, Calendar, TrendingUp } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export function ReservationListView() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize filters from URL
    const [filters, setFilters] = useState<FilterType>(() => {
        const params: FilterType = {
            page: Number(searchParams.get('page')) || 1,
            limit: Number(searchParams.get('limit')) || 12,
        };

        const status = searchParams.get('status');
        if (status) params.status = status as any;

        const date = searchParams.get('date');
        if (date) params.date = date;

        const search = searchParams.get('search');
        if (search) params.search = search;

        return params;
    });

    const { reservations, pagination, loading, refetch } = useReservations(filters);

    // Dialog states
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showCheckInDialog, setShowCheckInDialog] = useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [showNoShowDialog, setShowNoShowDialog] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();

        if (filters.page && filters.page !== 1) {
            params.set('page', filters.page.toString());
        }

        if (filters.status) {
            params.set('status', filters.status);
        }

        if (filters.date) {
            params.set('date', filters.date);
        }

        if (filters.search) {
            params.set('search', filters.search);
        }

        const queryString = params.toString();
        const newUrl = queryString ? `/reservations?${queryString}` : '/reservations';

        router.replace(newUrl, { scroll: false });
    }, [filters, router]);

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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header Section */}
            <div className="bg-linear-to-br from-white via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-8">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                    Reservations
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">
                                    Manage and track all restaurant reservations
                                </p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        {pagination.total > 0 && (
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
                                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Total: <span className="text-blue-600 dark:text-blue-400">{pagination.total}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm">
                                    <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Page: <span className="text-purple-600 dark:text-purple-400">{pagination.page} of {pagination.totalPages}</span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={() => router.push('/reservations/create')}
                        size="lg"
                        className="bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 shadow-xl shadow-blue-500/30 dark:shadow-blue-400/20 hover:shadow-2xl hover:shadow-blue-500/40 dark:hover:shadow-blue-400/30 transition-all duration-300 gap-2 text-base px-6 py-6"
                    >
                        <Plus className="w-5 h-5" />
                        New Reservation
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <ReservationFilters onFilterChange={handleFilterChange} />

            {/* List */}
            <div className="min-h-[400px]">
                <ReservationList
                    reservations={reservations}
                    loading={loading}
                    onReservationClick={handleReservationClick}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    onCheckIn={handleCheckIn}
                    showActions
                />
            </div>

            {/* Enhanced Pagination */}
            {pagination.totalPages > 1 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        {/* Page Info */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Showing{' '}
                                <span className="font-bold text-gray-900 dark:text-gray-100">
                                    {(pagination.page - 1) * pagination.limit + 1}
                                </span>
                                {' '}-{' '}
                                <span className="font-bold text-gray-900 dark:text-gray-100">
                                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                                </span>
                                {' '}of{' '}
                                <span className="font-bold text-gray-900 dark:text-gray-100">{pagination.total}</span>
                                {' '}reservations
                            </span>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="gap-2 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Button>

                            {/* Page Numbers */}
                            <div className="hidden sm:flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.page <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.page - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`min-w-10 h-10 px-3 rounded-lg font-semibold transition-all duration-200 ${pagination.page === pageNum
                                                ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Mobile Page Display */}
                            <div className="sm:hidden px-4 py-2 bg-gray-100 rounded-lg">
                                <span className="text-sm font-semibold text-gray-700">
                                    {pagination.page} / {pagination.totalPages}
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="gap-2 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full bg-linear-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${(pagination.page / pagination.totalPages) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Dialogs */}
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