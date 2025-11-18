'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useReservationStore } from '@/stores/reservationStore';
import { Reservation, CreateReservationDto, AvailableTable } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Calendar as CalendarIcon, Users, Clock, MapPin, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const reservationFormSchema = z.object({
    customerName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phoneNumber: z.string().regex(/^\d{10,15}$/, 'Invalid phone number (10-15 digits)'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    reservationDate: z.date({
        message: 'Please select a date',
    }),
    reservationTime: z.string().min(1, 'Please select a time'),
    headCount: z.number().min(1, 'At least 1 guest').max(50, 'Maximum 50 guests'),
    duration: z.number().min(30).max(480).optional(),
    tableId: z.number().optional(),
    floor: z.number().optional(),
    specialRequest: z.string().max(500).optional(),
    notes: z.string().max(500).optional(),
});

type ReservationFormValues = z.infer<typeof reservationFormSchema>;

interface ReservationFormDialogProps {
    reservation?: Reservation | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function ReservationFormDialog({
    reservation,
    open,
    onOpenChange,
    onSuccess,
}: ReservationFormDialogProps) {
    const {
        createReservation,
        updateReservation,
        checkAvailability,
        isLoading,
    } = useReservationStore();

    const [availableTables, setAvailableTables] = useState<AvailableTable[]>([]);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    const isEditMode = !!reservation;

    const form = useForm<ReservationFormValues>({
        resolver: zodResolver(reservationFormSchema),
        defaultValues: {
            customerName: reservation?.customerName || '',
            phoneNumber: reservation?.phoneNumber || '',
            email: reservation?.email || '',
            reservationDate: reservation?.reservationDate 
                ? new Date(reservation.reservationDate) 
                : new Date(),
            reservationTime: reservation?.reservationTime || '',
            headCount: reservation?.headCount || 2,
            duration: reservation?.duration || 120,
            tableId: reservation?.tableId,
            floor: reservation?.table?.floor,
            specialRequest: reservation?.specialRequest || '',
            notes: reservation?.notes || '',
        },
    });

    const watchDate = form.watch('reservationDate');
    const watchTime = form.watch('reservationTime');
    const watchHeadCount = form.watch('headCount');
    const watchDuration = form.watch('duration');
    const watchFloor = form.watch('floor');

    // Check availability when relevant fields change
    useEffect(() => {
        if (watchDate && watchTime && watchHeadCount) {
            handleCheckAvailability();
        }
    }, [watchDate, watchTime, watchHeadCount, watchDuration, watchFloor]);

    const handleCheckAvailability = async () => {
        if (!watchDate || !watchTime || !watchHeadCount) return;

        setCheckingAvailability(true);
        try {
            const dateStr = format(watchDate, 'yyyy-MM-dd');
            const availability = await checkAvailability({
                date: dateStr,
                time: watchTime,
                partySize: watchHeadCount,
                duration: watchDuration || 120,
                floor: watchFloor,
            });

            if (availability) {
                setAvailableTables(availability.tables);
            }
        } catch (error) {
            console.error('Error checking availability:', error);
        } finally {
            setCheckingAvailability(false);
        }
    };

    const onSubmit = async (values: ReservationFormValues) => {
        try {
            const data: CreateReservationDto = {
                customerName: values.customerName,
                phoneNumber: values.phoneNumber,
                email: values.email || undefined,
                reservationDate: format(values.reservationDate, 'yyyy-MM-dd'),
                reservationTime: values.reservationTime,
                headCount: values.headCount,
                duration: values.duration || 120,
                tableId: values.tableId,
                floor: values.floor,
                specialRequest: values.specialRequest || undefined,
                notes: values.notes || undefined,
            };

            if (isEditMode && reservation) {
                await updateReservation(reservation.reservationId, data);
            } else {
                await createReservation(data);
            }

            onSuccess?.();
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error('Error submitting reservation:', error);
        }
    };

    // Generate time slots (every 30 minutes from 10:00 to 22:00)
    const timeSlots: string[] = [];
    for (let hour = 10; hour <= 22; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            if (hour === 22 && minute > 0) break; // Stop at 22:00
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            timeSlots.push(time);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Edit Reservation' : 'New Reservation'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode 
                            ? 'Update the reservation details below'
                            : 'Fill in the details to create a new reservation'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Customer Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Customer Information</h3>
                            
                            <FormField
                                control={form.control}
                                name="customerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Smith" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="1234567890" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="email" 
                                                    placeholder="john@example.com" 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Reservation Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Reservation Details</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="reservationDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date *</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                'w-full pl-3 text-left font-normal',
                                                                !field.value && 'text-muted-foreground'
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, 'PPP')
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date < new Date(new Date().setHours(0, 0, 0, 0))
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="reservationTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Time *</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select time" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {timeSlots.map((time) => (
                                                        <SelectItem key={time} value={time}>
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="headCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Party Size *</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={50}
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                    />
                                                </div>
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
                                            <FormLabel>Duration (minutes)</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                                defaultValue={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select duration" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="60">1 hour</SelectItem>
                                                    <SelectItem value="90">1.5 hours</SelectItem>
                                                    <SelectItem value="120">2 hours</SelectItem>
                                                    <SelectItem value="150">2.5 hours</SelectItem>
                                                    <SelectItem value="180">3 hours</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Table Selection */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Table Selection</h3>
                                {checkingAvailability && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <LoadingSpinner size="sm" />
                                        <span>Checking availability...</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="floor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Preferred Floor</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                                value={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Any floor" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">Floor 1</SelectItem>
                                                    <SelectItem value="2">Floor 2</SelectItem>
                                                    <SelectItem value="3">Floor 3</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tableId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Table</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                                value={field.value?.toString()}
                                                disabled={availableTables.length === 0}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={
                                                            availableTables.length > 0 
                                                                ? 'Auto-assign or select'
                                                                : 'No tables available'
                                                        } />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0">Auto-assign</SelectItem>
                                                    {availableTables.map((table) => (
                                                        <SelectItem 
                                                            key={table.tableId} 
                                                            value={table.tableId.toString()}
                                                        >
                                                            Table {table.tableNumber} 
                                                            {' '}(Capacity: {table.capacity})
                                                            {table.floor && ` - Floor ${table.floor}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                {availableTables.length} table(s) available
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Additional Information</h3>

                            <FormField
                                control={form.control}
                                name="specialRequest"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Special Requests</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Birthday celebration, dietary restrictions, etc."
                                                className="resize-none"
                                                rows={3}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Any special requests or notes for the reservation
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Internal Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Staff notes (not visible to customer)"
                                                className="resize-none"
                                                rows={2}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        {isEditMode ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    isEditMode ? 'Update Reservation' : 'Create Reservation'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
