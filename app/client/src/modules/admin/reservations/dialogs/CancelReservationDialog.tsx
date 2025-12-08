import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useReservationActions } from '../hooks/useReservationActions';
import { Reservation } from '../types';
import { Loader2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CancelReservationDialogProps {
    open: boolean;
    reservation: Reservation | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function CancelReservationDialog({
    open,
    reservation,
    onClose,
    onSuccess,
}: CancelReservationDialogProps) {
    const { t } = useTranslation();
    const { cancelReservation, loading } = useReservationActions();
    const [reason, setReason] = useState('');

    const handleCancel = async () => {
        if (!reservation) return;

        try {
            await cancelReservation(reservation.reservationId, {
                reason: reason || undefined,
            });
            setReason('');
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
                        <XCircle className="w-5 h-5 text-red-600" />
                        <DialogTitle>{t('reservations.dialogs.cancelTitle')}</DialogTitle>
                    </div>
                    <DialogDescription>
                        {t('reservations.dialogs.cancelDesc', {
                            code: reservation.reservationCode,
                            name: reservation.customer?.name
                        })}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="reason">{t('reservations.dialogs.cancellationReasonOptional')}</Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={t('reservations.dialogs.reasonForCancellation')}
                            className="mt-2 resize-none"
                            rows={3}
                        />
                    </div>
                    <p className="text-sm text-gray-600">
                        {t('reservations.dialogs.cancelNotifyMessage')}
                    </p>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        {t('common.back')}
                    </Button>
                    <Button variant="destructive" onClick={handleCancel} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('reservations.cancelReservation')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
