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
import { Reservation, SeatReservationResponse } from '../types';
import { Loader2, UserCheck, Receipt } from 'lucide-react';
import { formatReservationDateTime } from '../utils';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

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
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
    const { seatReservation, loading } = useReservationActions();
    const [result, setResult] = useState<SeatReservationResponse | null>(null);
    const router = useRouter();

    const handleCheckIn = async () => {
        if (!reservation) return;

        try {
            const seatResult = await seatReservation(reservation.reservationId);
            setResult(seatResult);
            onSuccess();
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleViewOrder = () => {
        if (result?.order) {
            router.push(`/admin/orders?orderId=${result.order.orderId}`);
            handleClose();
        }
    };

    const handleClose = () => {
        setResult(null);
        onClose();
    };

    if (!reservation) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                {!result ? (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <DialogTitle>{t('reservations.dialogs.checkInTitle')}</DialogTitle>
                            </div>
                            <DialogDescription>
                                {t('reservations.dialogs.checkInDesc', {
                                    name: reservation.customer?.name,
                                    code: reservation.reservationCode,
                                })}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-3">
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {t('reservations.partySize')}:
                                    </span>
                                    <span className="font-medium">
                                        {reservation.partySize} {t('reservations.guests')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {t('reservations.reservationTime')}:
                                    </span>
                                    <span className="font-medium">
                                        {formatReservationDateTime(
                                            reservation.reservationDate,
                                            reservation.reservationTime,
                                            locale
                                        )}
                                    </span>
                                </div>
                                {reservation.table && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {t('reservations.table')}:
                                        </span>
                                        <span className="font-medium">
                                            {t('reservations.table')} {reservation.table.tableNumber}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('reservations.dialogs.checkInMessage')}
                            </p>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button onClick={handleCheckIn} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('reservations.checkIn')}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <DialogTitle>{t('reservations.dialogs.guestCheckedIn')}</DialogTitle>
                            </div>
                            <DialogDescription>
                                {t('reservations.dialogs.orderCreatedSuccessfully')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-3">
                            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {t('reservations.reservationCode')}:
                                    </span>
                                    <span className="font-medium">
                                        {result.reservation.reservationCode}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {t('reservations.dialogs.orderNumber')}:
                                    </span>
                                    <span className="font-semibold text-green-700 dark:text-green-300">
                                        {result.order.orderNumber}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {t('reservations.table')}:
                                    </span>
                                    <span className="font-medium">
                                        {result.reservation.table?.tableNumber}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('reservations.dialogs.addItemsMessage')}
                            </p>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleClose}>
                                {t('common.close')}
                            </Button>
                            <Button onClick={handleViewOrder}>
                                <Receipt className="mr-2 h-4 w-4" />
                                {t('reservations.dialogs.viewOrder')}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
