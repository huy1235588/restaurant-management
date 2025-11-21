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
import { Loader2, AlertCircle } from 'lucide-react';

interface NoShowDialogProps {
    open: boolean;
    reservation: Reservation | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function NoShowDialog({
    open,
    reservation,
    onClose,
    onSuccess,
}: NoShowDialogProps) {
    const { markNoShow, loading } = useReservationActions();

    const handleMarkNoShow = async () => {
        if (!reservation) return;

        try {
            await markNoShow(reservation.reservationId);
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
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <DialogTitle>Mark as No Show</DialogTitle>
                    </div>
                    <DialogDescription>
                        Mark reservation {reservation.reservationCode} for{' '}
                        {reservation.customer?.name} as no-show
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm text-gray-600">
                        This will record that the customer did not arrive for their reservation and
                        free up the table.
                    </p>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleMarkNoShow} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Mark No Show
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
