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

interface CompleteReservationDialogProps {
    open: boolean;
    reservation: Reservation | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function CompleteReservationDialog({
    open,
    reservation,
    onClose,
    onSuccess,
}: CompleteReservationDialogProps) {
    const { completeReservation, loading } = useReservationActions();

    const handleComplete = async () => {
        if (!reservation) return;

        try {
            await completeReservation(reservation.reservationId);
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
                        <CheckCircle className="w-5 h-5 text-gray-600" />
                        <DialogTitle>Complete Reservation</DialogTitle>
                    </div>
                    <DialogDescription>
                        Mark reservation {reservation.reservationCode} as completed
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm text-gray-600">
                        This will mark the reservation as completed and free up the table.
                    </p>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleComplete} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Complete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
