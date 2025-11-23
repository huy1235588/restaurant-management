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
import { Loader2, CheckCircle } from 'lucide-react';

interface ConfirmReservationDialogProps {
    open: boolean;
    reservation: Reservation | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function ConfirmReservationDialog({
    open,
    reservation,
    onClose,
    onSuccess,
}: ConfirmReservationDialogProps) {
    const { confirmReservation, loading } = useReservationActions();

    const handleConfirm = async () => {
        if (!reservation) return;

        try {
            await confirmReservation(reservation.reservationId);
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
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <DialogTitle>Confirm Reservation</DialogTitle>
                    </div>
                    <DialogDescription>
                        Confirm reservation {reservation.reservationCode} for{' '}
                        {reservation.customer?.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm text-gray-600">
                        This will notify the customer that their reservation has been confirmed.
                    </p>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Reservation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
