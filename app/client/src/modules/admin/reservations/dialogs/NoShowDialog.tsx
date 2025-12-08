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
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
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
                        <DialogTitle>{t('reservations.dialogs.noShowTitle')}</DialogTitle>
                    </div>
                    <DialogDescription>
                        {t('reservations.dialogs.noShowDesc', {
                            code: reservation.reservationCode,
                            name: reservation.customer?.name
                        })}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm text-gray-600">
                        {t('reservations.dialogs.noShowMessage')}
                    </p>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        {t('common.cancel')}
                    </Button>
                    <Button variant="destructive" onClick={handleMarkNoShow} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('reservations.dialogs.markNoShow')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
