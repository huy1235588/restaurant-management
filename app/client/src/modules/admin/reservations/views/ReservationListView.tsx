import { useState, useEffect } from 'react';
import { useReservations } from '../hooks/useReservations';
import { 
    ReservationList, 
    ReservationFilters, 
    GanttTimeline,
    ViewMode,
    DEFAULT_VIEW_MODE,
    VIEW_PREFERENCE_KEY,
} from '../components';
import { toDateString } from '../components/timeline/timeline.utils';
import {
    ConfirmReservationDialog,
    CancelReservationDialog,
    CheckInDialog,
    CompleteReservationDialog,
    NoShowDialog,
    CreateReservationDialog,
} from '../dialogs';
import { Reservation, ReservationFilterOptions as FilterType } from '../types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Plus, ChevronLeft, ChevronRight, Calendar, TrendingUp, Keyboard, Maximize2, Minimize2, RefreshCw, List, GanttChart } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/types/permissions';

export function ReservationListView() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    // Permission checks
    const canCreate = user ? hasPermission(user.role, 'reservations.create') : false;
    const canUpdate = user ? hasPermission(user.role, 'reservations.update') : false;
    const canCancel = user ? hasPermission(user.role, 'reservations.cancel') : false;

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showHelpDialog, setShowHelpDialog] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // View mode state (list or timeline)
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        // Initialize from URL or localStorage
        const urlView = searchParams.get('view') as ViewMode;
        if (urlView === 'list' || urlView === 'timeline') {
            return urlView;
        }
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(VIEW_PREFERENCE_KEY) as ViewMode;
            if (saved === 'list' || saved === 'timeline') {
                return saved;
            }
        }
        return DEFAULT_VIEW_MODE;
    });

    // Timeline date state
    const [timelineDate, setTimelineDate] = useState<Date>(() => {
        const urlDate = searchParams.get('date');
        if (urlDate) {
            const parsed = new Date(urlDate);
            if (!isNaN(parsed.getTime())) {
                return parsed;
            }
        }
        return new Date();
    });

    // Create dialog state for timeline
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [createDialogDefaults, setCreateDialogDefaults] = useState<{
        tableId?: number;
        time?: string;
        date?: string;
    }>({});

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

    // Timeline-specific filters
    const timelineFilters: FilterType = {
        date: toDateString(timelineDate),
        limit: 100, // Get all reservations for the day
    };

    // Use different filters based on view mode
    const { reservations, pagination, loading, refetch } = useReservations(
        viewMode === 'timeline' ? timelineFilters : filters
    );

    // Save view preference to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(VIEW_PREFERENCE_KEY, viewMode);
        }
    }, [viewMode]);

    // Handle view mode change
    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        // Sync date between views
        if (mode === 'timeline' && filters.date) {
            setTimelineDate(new Date(filters.date));
        }
    };

    // Handle timeline date change
    const handleTimelineDateChange = (date: Date) => {
        setTimelineDate(date);
    };

    // Handle empty cell click on timeline (create reservation)
    const handleEmptyCellClick = (tableId: number, time: string, date: string) => {
        setCreateDialogDefaults({
            tableId,
            time,
            date,
        });
        setShowCreateDialog(true);
    };

    // Dialog states
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showCheckInDialog, setShowCheckInDialog] = useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [showNoShowDialog, setShowNoShowDialog] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input field
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLSelectElement
            ) {
                return;
            }

            // Forward slash - focus search
            if (e.key === '/') {
                e.preventDefault();
                const searchInput = document.querySelector('input[placeholder*="search"]') as HTMLInputElement;
                if (searchInput) searchInput.focus();
            }
            // R - refresh list
            else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                refetch();
            }
            // Escape - clear filters
            else if (e.key === 'Escape') {
                e.preventDefault();
                setFilters({
                    page: 1,
                    limit: 12,
                });
            }
            // F or F11 - fullscreen
            else if (e.key === 'f' || e.key === 'F' || e.key === 'F11') {
                e.preventDefault();
                toggleFullscreen();
            }
            // ? - show help
            else if (e.shiftKey && e.key === '?') {
                e.preventDefault();
                setShowHelpDialog(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [refetch]);

    const toggleFullscreen = async () => {
        try {
            if (!isFullscreen) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refetch();
        } finally {
            setIsRefreshing(false);
        }
    };

    // Update URL when filters or view mode change
    useEffect(() => {
        const params = new URLSearchParams();

        // Add view mode to URL
        if (viewMode === 'timeline') {
            params.set('view', 'timeline');
            params.set('date', toDateString(timelineDate));
        } else {
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
        }

        const queryString = params.toString();
        const newUrl = queryString ? `/admin/reservations?${queryString}` : '/admin/reservations';

        router.replace(newUrl, { scroll: false });
    }, [filters, viewMode, timelineDate, router]);

    const handleFilterChange = (newFilters: Partial<FilterType>) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handleReservationClick = (reservation: Reservation) => {
        router.push(`/admin/reservations/${reservation.reservationId}`);
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
            <div className="bg-linear-to-br from-white via-blue-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight truncate">
                                    {t('reservations.title')}
                                </h1>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium mt-1 truncate">
                                    {t('reservations.pageDescription')}
                                </p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        {pagination.total > 0 && (
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
                                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {t('common.total')}: <span className="text-blue-600 dark:text-blue-400">{pagination.total}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-gray-900 rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm">
                                    <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {t('common.page')}: <span className="text-purple-600 dark:text-purple-400">{pagination.page} {t('common.of')} {pagination.totalPages}</span>
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Button
                            onClick={handleRefresh}
                            variant="outline"
                            size="default"
                            title={t('common.refresh')}
                            className="gap-2"
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden md:inline">{t('common.refresh')}</span>
                        </Button>
                        <Button
                            onClick={() => setShowHelpDialog(true)}
                            variant="outline"
                            size="default"
                            title={t('common.keyboardShortcuts')}
                            className="gap-2"
                        >
                            <Keyboard className="w-4 h-4" />
                            <span className="hidden xl:inline">{t('common.help')}</span>
                        </Button>
                        <Button
                            onClick={toggleFullscreen}
                            variant="outline"
                            size="default"
                            title={isFullscreen ? t('common.exitFullscreen') : t('common.fullscreen')}
                            className="gap-2"
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            <span className="hidden xl:inline">{isFullscreen ? t('common.exitFullscreen') : t('common.fullscreen')}</span>
                        </Button>
                        
                        {/* View Toggle Buttons */}
                        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <Button
                                onClick={() => handleViewModeChange('list')}
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="default"
                                className={`rounded-none gap-2 ${viewMode === 'list' ? '' : 'text-gray-600 dark:text-gray-400'}`}
                                title={t('reservations.timeline.listView')}
                            >
                                <List className="w-4 h-4" />
                                <span className="hidden xl:inline">{t('reservations.timeline.listView')}</span>
                            </Button>
                            <Button
                                onClick={() => handleViewModeChange('timeline')}
                                variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                                size="default"
                                className={`rounded-none gap-2 ${viewMode === 'timeline' ? '' : 'text-gray-600 dark:text-gray-400'}`}
                                title={t('reservations.timeline.timelineView')}
                            >
                                <GanttChart className="w-4 h-4" />
                                <span className="hidden xl:inline">{t('reservations.timeline.timelineView')}</span>
                            </Button>
                        </div>

                        {canCreate && (
                            <Button
                                onClick={() => router.push('/admin/reservations/create')}
                                size="default"
                                className="bg-linear-to-r shadow-xl shadow-blue-500/30 dark:shadow-blue-400/20 hover:shadow-2xl hover:shadow-blue-500/40 dark:hover:shadow-blue-400/30 transition-all duration-300 gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('common.newReservation')}</span>
                                <span className="sm:hidden">{t('common.new')}</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'list' ? (
                <>
                    {/* Filters */}
                    <ReservationFilters onFilterChange={handleFilterChange} />

                    {/* List */}
                    <div className="min-h-[400px]">
                        <ReservationList
                            reservations={reservations}
                            loading={loading}
                            onReservationClick={handleReservationClick}
                            onConfirm={canUpdate ? handleConfirm : undefined}
                            onCancel={canCancel ? handleCancel : undefined}
                            onCheckIn={canUpdate ? handleCheckIn : undefined}
                            showActions
                        />
                    </div>
                </>
            ) : (
                /* Gantt Timeline View */
                <GanttTimeline
                    reservations={reservations}
                    selectedDate={timelineDate}
                    onDateChange={handleTimelineDateChange}
                    onReservationClick={handleReservationClick}
                    onEmptyCellClick={handleEmptyCellClick}
                    loading={loading}
                />
            )}

            {/* Enhanced Pagination - only show in list view */}
            {viewMode === 'list' && pagination.totalPages > 1 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                    <div className="flex items-center justify-between">
                        {/* Page Info */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {t('common.showing')}{' '}
                                <span className="font-bold text-gray-900 dark:text-gray-100">
                                    {(pagination.page - 1) * pagination.limit + 1}
                                </span>
                                {' '}-{' '}
                                <span className="font-bold text-gray-900 dark:text-gray-100">
                                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                                </span>
                                {' '}{t('common.of')}{' '}
                                <span className="font-bold text-gray-900 dark:text-gray-100">{pagination.total}</span>
                                {' '}{t('reservations.reservations')}
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
                                {t('common.previous')}
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
                                {t('common.next')}
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

            {/* Create Reservation Dialog for Timeline */}
            <CreateReservationDialog
                open={showCreateDialog}
                onClose={() => {
                    setShowCreateDialog(false);
                    setCreateDialogDefaults({});
                }}
                onSuccess={() => {
                    refetch();
                    setShowCreateDialog(false);
                    setCreateDialogDefaults({});
                }}
                defaultTableId={createDialogDefaults.tableId}
                defaultDate={createDialogDefaults.date}
                defaultTime={createDialogDefaults.time}
            />

            {/* Keyboard Help Dialog */}
            <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Keyboard className="w-5 h-5" />
                            {t('common.keyboardShortcuts')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('reservations.keyboardShortcutsDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t('reservations.keyboard.search')}</span>
                            <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                /
                            </kbd>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t('reservations.keyboard.refresh')}</span>
                            <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                R
                            </kbd>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t('common.fullscreen')}</span>
                            <div className="flex items-center gap-2">
                                <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                    F
                                </kbd>
                                <span className="text-xs text-gray-500">{t('common.or')}</span>
                                <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                    F11
                                </kbd>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t('reservations.keyboard.clearFilters')}</span>
                            <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                Esc
                            </kbd>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t('common.showHelp')}</span>
                            <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                Shift + ?
                            </kbd>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}