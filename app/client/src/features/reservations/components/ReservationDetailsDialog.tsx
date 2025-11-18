'use client';

import React from 'react';
import { Reservation } from '@/types';
import { useReservationStore } from '@/stores/reservationStore';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { Separator } from '@/components/ui/separator';
import {
    Calendar,
    Clock,
    Users,
    Phone,
    Mail,
    MapPin,
    MessageSquare,
    FileText,
    User,
    Star,
    CheckCircle,
    XCircle,
    UserCheck,
    Ban,
} from 'lucide-react';
import { format } from 'date-fns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ReservationDetailsDialogProps {
    reservation: Reservation | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: () => void;
}

export function ReservationDetailsDialog({
    reservation,
    open,
    onOpenChange,
    onEdit,
}: ReservationDetailsDialogProps) {
    const {
        confirmReservation,
        markAsSeated,
        markAsCompleted,
        markAsNoShow,
        cancelReservation,
    } = useReservationStore();

    const [showCancelDialog, setShowCancelDialog] = React.useState(false);
    const [isProcessing, setIsProcessing] = React.useState(false);

    if (!reservation) return null;

    const formatDate = (date: string) => {
        try {
            return format(new Date(date), 'EEEE, MMMM dd, yyyy');
        } catch {
            return date;
        }
    };

    const formatDateTime = (dateTime?: string) => {
        if (!dateTime) return 'N/A';
        try {
            return format(new Date(dateTime), 'MMM dd, yyyy • hh:mm a');
        } catch {
            return dateTime;
        }
    };

    const handleAction = async (action: string) => {
        setIsProcessing(true);
        try {
            switch (action) {
                case 'confirm':
                    await confirmReservation(reservation.reservationId);
                    break;
                case 'seat':
                    await markAsSeated(reservation.reservationId);
                    break;
                case 'complete':
                    await markAsCompleted(reservation.reservationId);
                    break;
                case 'no-show':
                    await markAsNoShow(reservation.reservationId);
                    break;
                case 'cancel':
                    setShowCancelDialog(true);
                    return;
            }
            onOpenChange(false);
        } catch (error) {
            console.error('Error performing action:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancelConfirm = async () => {
        setIsProcessing(true);
        try {
            await cancelReservation(reservation.reservationId);
            setShowCancelDialog(false);
            onOpenChange(false);
        } catch (error) {
            console.error('Error cancelling reservation:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const getActionButtons = () => {
        const buttons = [];

        if (reservation.status === 'pending') {
            buttons.push(
                <Button
                    key="confirm"
                    onClick={() => handleAction('confirm')}
                    disabled={isProcessing}
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirm
                </Button>
            );
        }

        if (reservation.status === 'confirmed') {
            buttons.push(
                <Button
                    key="seat"
                    onClick={() => handleAction('seat')}
                    disabled={isProcessing}
                >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Mark as Seated
                </Button>
            );
        }

        if (reservation.status === 'seated') {
            buttons.push(
                <Button
                    key="complete"
                    onClick={() => handleAction('complete')}
                    disabled={isProcessing}
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete
                </Button>
            );
            buttons.push(
                <Button
                    key="no-show"
                    variant="outline"
                    onClick={() => handleAction('no-show')}
                    disabled={isProcessing}
                >
                    <Ban className="mr-2 h-4 w-4" />
                    Mark as No-show
                </Button>
            );
        }

        if (['pending', 'confirmed'].includes(reservation.status)) {
            buttons.push(
                <Button
                    key="cancel"
                    variant="destructive"
                    onClick={() => handleAction('cancel')}
                    disabled={isProcessing}
                >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                </Button>
            );
        }

        return buttons;
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle>Reservation Details</DialogTitle>
                                <DialogDescription>
                                    {reservation.reservationCode}
                                </DialogDescription>
                            </div>
                            <StatusBadge status={reservation.status} />
                        </div>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Reservation Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Reservation Information</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Date</p>
                                        <p className="text-base">
                                            {formatDate(reservation.reservationDate)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Time</p>
                                        <p className="text-base">
                                            {reservation.reservationTime}
                                            {reservation.duration && ` (${reservation.duration} min)`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Party Size</p>
                                        <p className="text-base">
                                            {reservation.headCount} {reservation.headCount > 1 ? 'guests' : 'guest'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Table</p>
                                        <p className="text-base">
                                            {reservation.table 
                                                ? `Table ${reservation.table.tableNumber}${reservation.table.floor ? ` • Floor ${reservation.table.floor}` : ''}`
                                                : 'Not assigned'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Customer Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                Customer Information
                                {reservation.customer?.isVip && (
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                )}
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                                        <p className="text-base">{reservation.customerName}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                        <p className="text-base">{reservation.phoneNumber}</p>
                                    </div>
                                </div>

                                {reservation.email && (
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                                            <p className="text-base">{reservation.email}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Special Requests & Notes */}
                        {(reservation.specialRequest || reservation.notes) && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Additional Information</h3>

                                    {reservation.specialRequest && (
                                        <div className="flex items-start gap-3">
                                            <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Special Requests
                                                </p>
                                                <p className="text-base">{reservation.specialRequest}</p>
                                            </div>
                                        </div>
                                    )}

                                    {reservation.notes && (
                                        <div className="flex items-start gap-3">
                                            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Internal Notes
                                                </p>
                                                <p className="text-base">{reservation.notes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Tags */}
                        {reservation.tags && reservation.tags.length > 0 && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {reservation.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Timestamps */}
                        <Separator />
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Created: {formatDateTime(reservation.createdAt)}</p>
                            {reservation.confirmedAt && (
                                <p>Confirmed: {formatDateTime(reservation.confirmedAt)}</p>
                            )}
                            {reservation.seatedAt && (
                                <p>Seated: {formatDateTime(reservation.seatedAt)}</p>
                            )}
                            {reservation.completedAt && (
                                <p>Completed: {formatDateTime(reservation.completedAt)}</p>
                            )}
                            {reservation.cancelledAt && (
                                <p>Cancelled: {formatDateTime(reservation.cancelledAt)}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        {onEdit && ['pending', 'confirmed'].includes(reservation.status) && (
                            <Button variant="outline" onClick={onEdit}>
                                Edit
                            </Button>
                        )}
                        {getActionButtons()}
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Reservation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this reservation for {reservation.customerName}?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>No, keep it</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Yes, cancel reservation
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
