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
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
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
                        <DialogTitle>{t('reservations.dialogs.completeTitle')}</DialogTitle>
                    </div>
                    <DialogDescription>
                        {t('reservations.dialogs.completeDesc', {
                            code: reservation.reservationCode
                        })}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm text-gray-600">
                        {t('reservations.dialogs.completeMessage')}
                    </p>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleComplete} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('common.complete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
