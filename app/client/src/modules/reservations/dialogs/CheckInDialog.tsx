import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useReservationActions } from '../hooks/useReservationActions';
import { Reservation } from '../types';
import { Loader2, UserCheck } from 'lucide-react';
import { formatReservationDateTime } from '../utils';

interface CheckInDialogProps {
    open: boolean;
    reservation: Reservation | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function CheckInDialog({
    open,
    reservation,
    onClose,
    onSuccess,
}: CheckInDialogProps) {
    const { seatReservation, loading } = useReservationActions();

    const handleCheckIn = async () => {
        if (!reservation) return;

        try {
            await seatReservation(reservation.reservationId);
            onSuccess();
            onClose();
        } catch (error) {
            // Error handled by hook
        }
    };

    if (!reservation) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-green-600" />
                        <DialogTitle>Check In Guest</DialogTitle>
                    </div>
                    <DialogDescription>
                        Check in {reservation.customer?.name} for reservation{' '}
                        {reservation.reservationCode}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Party Size:</span>
                            <span className="font-medium">{reservation.partySize} guests</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Time:</span>
                            <span className="font-medium">
                                {formatReservationDateTime(reservation.reservationDate, reservation.reservationTime)}
                            </span>
                        </div>
                        {reservation.table && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Table:</span>
                                <span className="font-medium">
                                    Table {reservation.table.tableNumber}
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-gray-600">
                        The table status will be updated to &quot;occupied&quot;.
                    </p>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleCheckIn} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Check In
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
