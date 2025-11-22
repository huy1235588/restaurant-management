'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateReservation, useAvailableTables } from '../../hooks';
import { CreateReservationDto } from '../../types';
import { Calendar, Clock, Users } from 'lucide-react';

interface CreateReservationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateReservationDialog({
    open,
    onOpenChange,
}: CreateReservationDialogProps) {
    const { mutate: createReservation, isPending } = useCreateReservation();
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<CreateReservationDto>();

    const reservationDate = watch('reservationDate');
    const reservationTime = watch('reservationTime');
    const partySize = watch('partySize');

    const { data: availableTables = [] } = useAvailableTables(
        reservationDate,
        reservationTime,
        partySize
    );

    const onSubmit = (data: CreateReservationDto) => {
        createReservation(data, {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create New Reservation</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="customerName">Customer Name *</Label>
                            <Input
                                id="customerName"
                                {...register('customerName', {
                                    required: 'Customer name is required',
                                })}
                                placeholder="John Doe"
                            />
                            {errors.customerName && (
                                <p className="text-sm text-destructive">
                                    {errors.customerName.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number *</Label>
                            <Input
                                id="phoneNumber"
                                {...register('phoneNumber', {
                                    required: 'Phone number is required',
                                })}
                                placeholder="0123456789"
                            />
                            {errors.phoneNumber && (
                                <p className="text-sm text-destructive">
                                    {errors.phoneNumber.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="reservationDate" className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Date *
                            </Label>
                            <Input
                                id="reservationDate"
                                type="date"
                                {...register('reservationDate', {
                                    required: 'Date is required',
                                })}
                            />
                            {errors.reservationDate && (
                                <p className="text-sm text-destructive">
                                    {errors.reservationDate.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reservationTime" className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Time *
                            </Label>
                            <Input
                                id="reservationTime"
                                type="time"
                                {...register('reservationTime', {
                                    required: 'Time is required',
                                })}
                            />
                            {errors.reservationTime && (
                                <p className="text-sm text-destructive">
                                    {errors.reservationTime.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="partySize" className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                Guests *
                            </Label>
                            <Input
                                id="partySize"
                                type="number"
                                min="1"
                                {...register('partySize', {
                                    required: 'Party size is required',
                                    valueAsNumber: true,
                                })}
                                placeholder="2"
                            />
                            {errors.partySize && (
                                <p className="text-sm text-destructive">
                                    {errors.partySize.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {reservationDate && reservationTime && partySize && (
                        <div className="space-y-2">
                            <Label>Available Tables</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {availableTables.map((table) => (
                                    <label
                                        key={table.tableId}
                                        className="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-accent"
                                    >
                                        <input
                                            type="radio"
                                            value={table.tableId}
                                            {...register('tableId', {
                                                valueAsNumber: true,
                                            })}
                                        />
                                        <span className="text-sm">
                                            Table {table.tableNumber} ({table.capacity})
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {availableTables.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    No tables available for selected date/time
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="specialRequest">Special Requests (Optional)</Label>
                        <Textarea
                            id="specialRequest"
                            {...register('specialRequest')}
                            placeholder="Any special requests..."
                            rows={3}
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
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Creating...' : 'Create Reservation'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
