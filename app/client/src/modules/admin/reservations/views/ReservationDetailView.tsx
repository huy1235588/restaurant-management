import { useState, useEffect } from 'react';
import { useReservation } from '../hooks/useReservations';
import { useReservationActions } from '../hooks/useReservationActions';
import { StatusBadge, AuditTimeline } from '../components';
import {
    ConfirmReservationDialog,
    CancelReservationDialog,
    CheckInDialog,
    CompleteReservationDialog,
    NoShowDialog,
} from '../dialogs';
import {
    formatReservationDateTime,
    formatDuration,
    formatPhoneNumber,
    canEditReservation,
    canCancelReservation,
    getAvailableActions,
} from '../utils';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Calendar,
    Clock,
    Users,
    Phone,
    Mail,
    MapPin,
    FileText,
    ArrowLeft,
    CheckCircle,
    XCircle,
    UserCheck,
    AlertCircle,
    Loader2,
    Edit,
    MoreVertical,
    Keyboard,
    Maximize2,
    Minimize2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface ReservationDetailViewProps {
    reservationId: number;
}

export function ReservationDetailView({ reservationId }: ReservationDetailViewProps) {
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
    const router = useRouter();
    const { reservation, loading, refetch } = useReservation(reservationId);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showHelpDialog, setShowHelpDialog] = useState(false);

    // Dialog states
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showCheckInDialog, setShowCheckInDialog] = useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [showNoShowDialog, setShowNoShowDialog] = useState(false);

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

            // B - back
            if (e.key === 'b' || e.key === 'B') {
                e.preventDefault();
                router.push('/admin/reservations');
            }
            // Ctrl+P - print
            else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                window.print();
            }
            // F or F11 - fullscreen
            else if (e.key === 'f' || e.key === 'F' || e.key === 'F11') {
                e.preventDefault();
                toggleFullscreen();
            }
            // C - confirm (if available)
            else if (e.key === 'c' || e.key === 'C') {
                const availableActions = reservation ? getAvailableActions(reservation.status) : [];
                if (availableActions.includes('confirm')) {
                    e.preventDefault();
                    setShowConfirmDialog(true);
                }
            }
            // X - cancel (if available)
            else if (e.key === 'x' || e.key === 'X') {
                const availableActions = reservation ? getAvailableActions(reservation.status) : [];
                if (availableActions.includes('cancel')) {
                    e.preventDefault();
                    setShowCancelDialog(true);
                }
            }
            // ? - show help
            else if (e.shiftKey && e.key === '?') {
                e.preventDefault();
                setShowHelpDialog(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router, reservation]);

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                    <Loader2 className="w-16 h-16 animate-spin text-blue-600 dark:text-blue-400" />
                    <div className="absolute inset-0 w-16 h-16 animate-ping text-blue-400 dark:text-blue-500 opacity-20">
                        <Loader2 className="w-16 h-16" />
                    </div>
                </div>
                <p className="mt-6 text-base font-semibold text-gray-700 dark:text-gray-300">{t('reservations.timeline.loadingReservationDetails')}</p>
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('reservations.timeline.reservationNotFound')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{t('reservations.timeline.reservationNotFoundDesc')}</p>
                <Button onClick={() => router.push('/admin/reservations')} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    {t('reservations.backToReservations')}
                </Button>
            </div>
        );
    }

    const availableActions = getAvailableActions(reservation.status);

    return (
        <div className="space-y-6 pb-8">
            {/* Header Section */}
            <div className="bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/admin/reservations')}
                        className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('common.back')}
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setShowHelpDialog(true)}
                            variant="outline"
                            size="sm"
                            title={t('common.keyboardShortcuts')}
                            className="gap-2"
                        >
                            <Keyboard className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('common.help')}</span>
                        </Button>
                        <Button
                            onClick={toggleFullscreen}
                            variant="outline"
                            size="sm"
                            title={isFullscreen ? t('common.exitFullscreen') + ' (F)' : t('common.fullscreen') + ' (F)'}
                            className="gap-2"
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            <span className="hidden sm:inline">{isFullscreen ? t('common.exitFullscreen') : t('common.fullscreen')}</span>
                        </Button>
                        {canEditReservation(reservation.status) && (
                            <Button variant="outline" size="sm" className="gap-2">
                                <Edit className="w-4 h-4" />
                                {t('common.edit')}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                {reservation.reservationCode}
                            </h1>
                            <StatusBadge status={reservation.status} />
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <p className="font-medium">
                                {formatReservationDateTime(reservation.reservationDate, undefined, locale)}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 justify-end">
                        {availableActions.includes('confirm') && (
                            <Button
                                onClick={() => setShowConfirmDialog(true)}
                                className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 shadow-lg shadow-blue-500/30 dark:shadow-blue-400/20"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {t('common.confirm')}
                            </Button>
                        )}
                        {availableActions.includes('seat') && (
                            <Button
                                onClick={() => setShowCheckInDialog(true)}
                                className="bg-linear-to-r from-green-600 to-green-700 dark:from-green-500 dark:to-green-600 hover:from-green-700 hover:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 shadow-lg shadow-green-500/30 dark:shadow-green-400/20"
                            >
                                <UserCheck className="w-4 h-4 mr-2" />
                                {t('reservations.checkIn')}
                            </Button>
                        )}
                        {availableActions.includes('complete') && (
                            <Button
                                onClick={() => setShowCompleteDialog(true)}
                                className="bg-linear-to-r from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 hover:from-emerald-700 hover:to-emerald-800 dark:hover:from-emerald-600 dark:hover:to-emerald-700 shadow-lg shadow-emerald-500/30 dark:shadow-emerald-400/20"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {t('reservations.complete')}
                            </Button>
                        )}
                        {reservation.status === 'confirmed' && (
                            <Button
                                variant="outline"
                                onClick={() => setShowNoShowDialog(true)}
                                className="border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950"
                            >
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {t('reservations.markNoShow')}
                            </Button>
                        )}
                        {availableActions.includes('cancel') && (
                            <Button
                                variant="outline"
                                onClick={() => setShowCancelDialog(true)}
                                className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                {t('common.cancel')}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="details" className="w-full">
                <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-xl shadow-sm">
                    <TabsTrigger
                        value="details"
                        className="rounded-lg data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 dark:data-[state=active]:from-blue-500 dark:data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        {t('common.viewDetails')}
                    </TabsTrigger>
                    <TabsTrigger
                        value="history"
                        className="rounded-lg data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 dark:data-[state=active]:from-purple-500 dark:data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                        <Clock className="w-4 h-4 mr-2" />
                        {t('reservations.history')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-5 mt-6">
                    {/* Customer Information */}
                    <Card className="pt-0 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow duration-300 rounded-xl overflow-hidden">
                        <CardHeader className="pt-6 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b border-blue-100 dark:border-blue-900">
                            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                                    <Users className="w-4 h-4 text-white" />
                                </div>
                                {t('reservations.customerInfo')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center shrink-0">
                                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{t('common.name')}</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{reservation.customer?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center shrink-0">
                                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{t('reservations.customerPhone')}</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                        {formatPhoneNumber(reservation.customer?.phoneNumber || '')}
                                    </p>
                                </div>
                            </div>
                            {reservation.customer?.email && (
                                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{t('reservations.customerEmail')}</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{reservation.customer?.email}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Reservation Details */}
                    <Card className="pt-0 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow duration-300 rounded-xl overflow-hidden">
                        <CardHeader className="pt-6 bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-b border-purple-100 dark:border-purple-900">
                            <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                                <div className="w-8 h-8 bg-purple-600 dark:bg-purple-500 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-white" />
                                </div>
                                {t('reservations.reservationDetails')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center shrink-0">
                                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{t('reservations.dateTime')}</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                        {formatReservationDateTime(reservation.reservationDate, reservation.reservationTime, locale)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{t('reservations.duration')}</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                        {formatDuration(reservation.duration, locale)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center shrink-0">
                                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{t('reservations.partySize')}</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{reservation.partySize} {t('reservations.guests')}</p>
                                </div>
                            </div>
                            {reservation.table && (
                                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{t('reservations.table')}</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                            Table {reservation.table.tableNumber}
                                            {reservation.table.tableName &&
                                                ` (${reservation.table.tableName})`}
                                        </p>
                                        {reservation.table.section && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {reservation.table.section}
                                                {reservation.table.floor &&
                                                    ` - Floor ${reservation.table.floor}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {reservation.specialRequest && (
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-linear-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border border-amber-200 dark:border-amber-800">
                                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 uppercase tracking-wide mb-1">{t('reservations.specialRequests')}</p>
                                        <p className="font-medium text-amber-900 dark:text-amber-200 leading-relaxed">{reservation.specialRequest}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Cancellation Info */}
                    {reservation.status === 'cancelled' && reservation.cancellationReason && (
                        <Card className="pt-0 border-red-300 dark:border-red-800 bg-linear-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950 shadow-lg rounded-xl overflow-hidden">
                            <CardHeader className="pt-6 bg-linear-to-r from-red-100 to-rose-100 dark:from-red-900 dark:to-rose-900 border-b border-red-200 dark:border-red-800">
                                <CardTitle className="flex items-center gap-2 text-red-900 dark:text-red-100">
                                    <div className="w-8 h-8 bg-red-600 dark:bg-red-500 rounded-lg flex items-center justify-center">
                                        <XCircle className="w-4 h-4 text-white" />
                                    </div>
                                    {t('reservations.cancellationReason')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm font-medium text-red-900 dark:text-red-200 leading-relaxed">
                                    {reservation.cancellationReason}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <Card className="pt-0 border-gray-200 dark:border-gray-700 shadow-md rounded-xl overflow-hidden">
                        <CardHeader className="pt-6 bg-linear-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-b border-purple-100 dark:border-purple-900">
                            <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                                <div className="w-8 h-8 bg-purple-600 dark:bg-purple-500 rounded-lg flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-white" />
                                </div>
                                {t('reservations.activityHistory')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AuditTimeline audits={reservation.audits || []} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <ConfirmReservationDialog
                open={showConfirmDialog}
                reservation={reservation}
                onClose={() => setShowConfirmDialog(false)}
                onSuccess={refetch}
            />
            <CancelReservationDialog
                open={showCancelDialog}
                reservation={reservation}
                onClose={() => setShowCancelDialog(false)}
                onSuccess={refetch}
            />
            <CheckInDialog
                open={showCheckInDialog}
                reservation={reservation}
                onClose={() => setShowCheckInDialog(false)}
                onSuccess={refetch}
            />
            <CompleteReservationDialog
                open={showCompleteDialog}
                reservation={reservation}
                onClose={() => setShowCompleteDialog(false)}
                onSuccess={refetch}
            />
            <NoShowDialog
                open={showNoShowDialog}
                reservation={reservation}
                onClose={() => setShowNoShowDialog(false)}
                onSuccess={refetch}
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
                            {t('reservations.keyboard.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t('reservations.keyboard.back')}</span>
                            <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                B
                            </kbd>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t('reservations.keyboard.print')}</span>
                            <div className="flex items-center gap-2">
                                <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                    Ctrl
                                </kbd>
                                <span className="text-xs text-gray-500">+</span>
                                <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                    P
                                </kbd>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t('reservations.keyboard.confirmReservation')}</span>
                            <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                C
                            </kbd>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t('reservations.keyboard.cancelReservation')}</span>
                            <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                X
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
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t('reservations.keyboard.showHelp')}</span>
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