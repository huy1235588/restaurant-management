import { useState } from 'react';
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
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReservationDetailViewProps {
    reservationId: number;
}

export function ReservationDetailView({ reservationId }: ReservationDetailViewProps) {
    const router = useRouter();
    const { reservation, loading, refetch } = useReservation(reservationId);

    // Dialog states
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showCheckInDialog, setShowCheckInDialog] = useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [showNoShowDialog, setShowNoShowDialog] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Reservation not found</p>
            </div>
        );
    }

    const availableActions = getAvailableActions(reservation.status);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/reservations')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {reservation.reservationCode}
                            </h1>
                            <StatusBadge status={reservation.status} />
                        </div>
                        <p className="text-gray-500 mt-1">
                            {formatReservationDateTime(reservation.reservationDate)}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {availableActions.includes('confirm') && (
                        <Button onClick={() => setShowConfirmDialog(true)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm
                        </Button>
                    )}
                    {availableActions.includes('seat') && (
                        <Button onClick={() => setShowCheckInDialog(true)}>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Check In
                        </Button>
                    )}
                    {availableActions.includes('complete') && (
                        <Button onClick={() => setShowCompleteDialog(true)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Complete
                        </Button>
                    )}
                    {availableActions.includes('cancel') && (
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelDialog(true)}
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    )}
                    {reservation.status === 'confirmed' && (
                        <Button
                            variant="outline"
                            onClick={() => setShowNoShowDialog(true)}
                        >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            No Show
                        </Button>
                    )}
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="details" className="w-full">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{reservation.customer?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium">
                                        {formatPhoneNumber(reservation.customer?.phoneNumber || '')}
                                    </p>
                                </div>
                            </div>
                            {reservation.customer?.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{reservation.customer?.email}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Reservation Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Reservation Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Date & Time</p>
                                    <p className="font-medium">
                                        {formatReservationDateTime(reservation.reservationDate, reservation.reservationTime)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Duration</p>
                                    <p className="font-medium">
                                        {formatDuration(reservation.duration)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Party Size</p>
                                    <p className="font-medium">{reservation.partySize} guests</p>
                                </div>
                            </div>
                            {reservation.table && (
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Table</p>
                                        <p className="font-medium">
                                            Table {reservation.table.tableNumber}
                                            {reservation.table.tableName &&
                                                ` (${reservation.table.tableName})`}
                                        </p>
                                        {reservation.table.section && (
                                            <p className="text-sm text-gray-400">
                                                {reservation.table.section}
                                                {reservation.table.floor &&
                                                    ` - Floor ${reservation.table.floor}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {reservation.specialRequest && (
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Special Requests</p>
                                        <p className="font-medium">{reservation.specialRequest}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Cancellation Info */}
                    {reservation.status === 'cancelled' && reservation.cancellationReason && (
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader>
                                <CardTitle className="text-red-800">Cancellation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-red-700">
                                    {reservation.cancellationReason}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity History</CardTitle>
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
        </div>
    );
}
