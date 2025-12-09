import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useReservationActions } from '@/modules/admin/reservations/hooks/useReservationActions';
import { useTableAvailability } from '@/modules/admin/reservations/hooks/useTableAvailability';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type ReservationFormData = {
    customerName: string;
    phoneNumber: string;
    email?: string;
    partySize: number;
    reservationDate: string;
    duration: number;
    specialRequests?: string;
    tableId?: number;
};

interface CreateReservationDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    /** Pre-select a table (from timeline click) */
    defaultTableId?: number;
    /** Pre-fill date in YYYY-MM-DD format (from timeline) */
    defaultDate?: string;
    /** Pre-fill time in HH:mm format (from timeline) */
    defaultTime?: string;
}

export function CreateReservationDialog({
    open,
    onClose,
    onSuccess,
    defaultTableId,
    defaultDate,
    defaultTime,
}: CreateReservationDialogProps) {
    const { t } = useTranslation();
    const { createReservation, loading } = useReservationActions();
    
    const reservationSchema = z.object({
        customerName: z.string().min(1, t('reservations.validation.nameRequired')).max(100, t('reservations.validation.nameMax')),
        phoneNumber: z.string().min(10, t('reservations.validation.phoneMin')),
        email: z.string().email(t('reservations.validation.emailInvalid')).optional().or(z.literal('')),
        partySize: z.number().min(1, t('reservations.validation.partySizeMin')).max(50, t('reservations.validation.partySizeMax')),
        reservationDate: z.string().min(1, t('reservations.validation.dateRequired')),
        duration: z.number().min(30, t('reservations.validation.durationMin')).max(480, t('reservations.validation.durationMax')),
        specialRequests: z.string().max(500, t('reservations.validation.specialRequestsMax')).optional(),
        tableId: z.number().optional(),
    });
    const [availabilityParams, setAvailabilityParams] = useState<any>(null);
    const { tables, loading: loadingTables } = useTableAvailability(availabilityParams);

    const form = useForm<ReservationFormData>({
        resolver: zodResolver(reservationSchema),
        defaultValues: {
            customerName: '',
            phoneNumber: '',
            email: '',
            partySize: 2,
            reservationDate: '',
            duration: 120,
            specialRequests: '',
            tableId: undefined,
        },
    });

    // Apply default values from timeline click
    useEffect(() => {
        if (open) {
            if (defaultDate && defaultTime) {
                // Combine date and time for datetime-local input
                form.setValue('reservationDate', `${defaultDate}T${defaultTime}`);
            } else if (defaultDate) {
                form.setValue('reservationDate', `${defaultDate}T12:00`);
            }
            if (defaultTableId) {
                form.setValue('tableId', defaultTableId);
            }
        }
    }, [open, defaultDate, defaultTime, defaultTableId, form]);

    // Watch date and party size to check availability
    const watchDate = form.watch('reservationDate');
    const watchPartySize = form.watch('partySize');
    const watchDuration = form.watch('duration');

    useEffect(() => {
        if (watchDate && watchPartySize) {
            // Convert datetime-local to ISO format for API
            const isoDate = new Date(watchDate).toISOString();
            setAvailabilityParams({
                date: isoDate,
                partySize: watchPartySize,
                duration: watchDuration,
            });
        }
    }, [watchDate, watchPartySize, watchDuration]);

    const onSubmit = async (data: ReservationFormData) => {
        try {
            // Parse datetime-local input (format: "2024-12-25T19:00")
            const [dateStr, timeStr] = data.reservationDate.split('T');
            
            await createReservation({
                customerName: data.customerName,
                phoneNumber: data.phoneNumber,
                email: data.email || undefined,
                partySize: data.partySize,
                reservationDate: dateStr, // "2024-12-25"
                reservationTime: timeStr || '12:00', // "19:00"
                duration: data.duration,
                specialRequest: data.specialRequests || undefined,
                tableId: data.tableId,
            });
            form.reset();
            onSuccess();
            onClose();
        } catch (error) {
            // Error already handled by hook
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('reservations.dialog.createTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('reservations.dialog.createDescription')}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Customer Information */}
                        <div className="space-y-3">
                            <h3 className="font-medium text-sm text-gray-700">
                                {t('reservations.dialog.customerInformationSection')}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="customerName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('reservations.dialog.nameLabel')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('reservations.dialog.namePlaceholder')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('reservations.dialog.phoneLabel')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t('reservations.dialog.phonePlaceholder')}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('reservations.dialog.emailLabel')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder={t('reservations.dialog.emailPlaceholder')}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Reservation Details */}
                        <div className="space-y-3">
                            <h3 className="font-medium text-sm text-gray-700">
                                {t('reservations.dialog.reservationDetailsSection')}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="partySize"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('reservations.dialog.partySizeLabel')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(parseInt(e.target.value) || 1)
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="duration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('reservations.dialog.durationLabel')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="30"
                                                    step="30"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(parseInt(e.target.value) || 120)
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="reservationDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('reservations.dialog.dateTimeLabel')}</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Table Selection */}
                        {tables.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-medium text-sm text-gray-700">
                                    {t('reservations.dialog.availableTablesSection')}
                                </h3>
                                <FormField
                                    control={form.control}
                                    name="tableId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {tables.map((table: any) => (
                                                        <button
                                                            key={table.id}
                                                            type="button"
                                                            onClick={() => field.onChange(table.id)}
                                                            className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                                                                field.value === table.id
                                                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {t('reservations.dialog.tableNumberLabel', { number: table.tableNumber })}
                                                            <br />
                                                            <span className="text-xs text-gray-500">
                                                                {t('reservations.dialog.seatsLabel', { count: table.capacity })}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {loadingTables && (
                                    <p className="text-sm text-gray-500">
                                        {t('reservations.dialog.checkingAvailabilityText')}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Special Requests */}
                        <FormField
                            control={form.control}
                            name="specialRequests"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('reservations.dialog.specialRequestsLabel')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('reservations.dialog.specialRequestsPlaceholder')}
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={loading}
                            >
                                {t('reservations.dialog.cancelButton')}
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('reservations.dialog.createButton')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
