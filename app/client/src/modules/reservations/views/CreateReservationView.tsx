import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useReservationActions } from '@/modules/reservations/hooks/useReservationActions';
import { useTableAvailability } from '@/modules/reservations/hooks/useTableAvailability';
import { TableSelector } from '@/modules/reservations/components/TableSelector';
import { ArrowLeft, Calendar, Users, Clock, Mail, Phone, User, FileText, Loader2, Keyboard, Maximize2, Minimize2 } from 'lucide-react';

const reservationSchema = z.object({
    customerName: z.string().min(1, 'Name is required').max(100),
    phoneNumber: z.string().min(10, 'Valid phone number required'),
    email: z.string().email('Valid email required').optional().or(z.literal('')),
    partySize: z.number().min(1, 'At least 1 guest').max(50),
    reservationDate: z.string().min(1, 'Date is required'),
    duration: z.number().min(30, 'Minimum 30 minutes').max(480),
    specialRequests: z.string().max(500).optional(),
    tableId: z.number().optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

export function CreateReservationView() {
    const router = useRouter();
    const { createReservation, loading } = useReservationActions();
    const [availabilityParams, setAvailabilityParams] = useState<any>(null);
    const { tables, loading: loadingTables } = useTableAvailability(availabilityParams);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showHelpDialog, setShowHelpDialog] = useState(false);

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

    // Watch date and party size to check availability
    const watchDate = form.watch('reservationDate');
    const watchPartySize = form.watch('partySize');
    const watchDuration = form.watch('duration');

    useEffect(() => {
        if (watchDate && watchPartySize) {
            const isoDate = new Date(watchDate).toISOString();
            setAvailabilityParams({
                date: isoDate,
                partySize: watchPartySize,
                duration: watchDuration,
            });
        }
    }, [watchDate, watchPartySize, watchDuration]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input field
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLSelectElement
            ) {
                return;
            }

            // Ctrl+S - submit form
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                form.handleSubmit(onSubmit)();
            }
            // B - back
            else if (e.key === 'b' || e.key === 'B') {
                e.preventDefault();
                router.back();
            }
            // F or F11 - fullscreen
            else if (e.key === 'f' || e.key === 'F' || e.key === 'F11') {
                e.preventDefault();
                toggleFullscreen();
            }
            // ? - show help
            else if (e.shiftKey && e.key === '?') {
                e.preventDefault();
                setShowHelpDialog(true);
            }
            // Escape - cancel
            else if (e.key === 'Escape') {
                e.preventDefault();
                router.back();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [form, router]);

    const toggleFullscreen = async () => {
        try {
            if (!isFullscreen) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    };

    const onSubmit = async (data: ReservationFormData) => {
        try {
            const [dateStr, timeStr] = data.reservationDate.split('T');

            await createReservation({
                customerName: data.customerName,
                phoneNumber: data.phoneNumber,
                email: data.email || undefined,
                partySize: data.partySize,
                reservationDate: dateStr,
                reservationTime: timeStr || '12:00',
                duration: data.duration,
                specialRequest: data.specialRequests || undefined,
                tableId: data.tableId,
            });

            router.push('/reservations');
        } catch (error) {
            // Error already handled by hook
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="ghost"
                            onClick={handleCancel}
                            className="gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Reservations
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                onClick={() => setShowHelpDialog(true)}
                                variant="outline"
                                size="sm"
                                title="Keyboard shortcuts (Shift+?)"
                                className="gap-2"
                            >
                                <Keyboard className="w-4 h-4" />
                                <span className="hidden sm:inline">Help</span>
                            </Button>
                            <Button
                                type="button"
                                onClick={toggleFullscreen}
                                variant="outline"
                                size="sm"
                                title={isFullscreen ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'}
                                className="gap-2"
                            >
                                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                Create Reservation
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Fill in the details to create a new reservation
                            </p>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Customer Information Card */}
                        <Card className="pt-0 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                            <CardHeader className="pt-6 rounded-t-xl rounded-tr-xl bg-linear-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Customer Information</CardTitle>
                                        <CardDescription>Enter the customer's contact details</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <FormField
                                    control={form.control}
                                    name="customerName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-500" />
                                                Full Name *
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="John Doe"
                                                    className="h-12 text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-500" />
                                                    Phone Number *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="(555) 123-4567"
                                                        className="h-12 text-base"
                                                        {...field}
                                                    />
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
                                                <FormLabel className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                    Email (Optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="john@example.com"
                                                        className="h-12 text-base"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reservation Details Card */}
                        <Card className="pt-0 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                            <CardHeader className="pt-6 rounded-t-xl rounded-tr-xl bg-linear-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-600 dark:bg-purple-500 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Reservation Details</CardTitle>
                                        <CardDescription>Set the date, time, and party size</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <FormField
                                    control={form.control}
                                    name="reservationDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                Date & Time *
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="datetime-local"
                                                    className="h-12 text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Select the reservation date and time
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="partySize"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-500" />
                                                    Party Size *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        max="50"
                                                        className="h-12 text-base"
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(parseInt(e.target.value) || 1)
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Number of guests (1-50)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="duration"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                    Duration (minutes) *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="30"
                                                        max="480"
                                                        step="30"
                                                        className="h-12 text-base"
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(parseInt(e.target.value) || 120)
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Expected duration (30-480 min)
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Table Selection Card */}
                        <TableSelector
                            tables={tables}
                            loading={loadingTables}
                            selectedTableId={form.watch('tableId')}
                            onSelectTable={(tableId) => {
                                form.setValue('tableId', tableId, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                    shouldTouch: true
                                });
                            }}
                        />

                        {/* Special Requests Card */}
                        <Card className="pt-0 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                            <CardHeader className="pt-6 rounded-t-xl rounded-tr-xl bg-linear-to-r from-gray-50 to-gray-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-600 dark:bg-gray-500 rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">Special Requests</CardTitle>
                                        <CardDescription>Any additional notes or requests</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <FormField
                                    control={form.control}
                                    name="specialRequests"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Any special requests, dietary restrictions, occasion details..."
                                                    className="resize-none min-h-32 text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Maximum 500 characters
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-end pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={handleCancel}
                                disabled={loading}
                                className="px-8"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="lg"
                                disabled={loading}
                                className="bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 shadow-xl shadow-blue-500/30 dark:shadow-blue-400/20 px-8"
                            >
                                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                Create Reservation
                            </Button>
                        </div>
                    </form>
                </Form>

                {/* Keyboard Help Dialog */}
                <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Keyboard className="w-5 h-5" />
                                Keyboard Shortcuts
                            </DialogTitle>
                            <DialogDescription>
                                Quick keyboard shortcuts to navigate the reservation creation form
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Submit Form</span>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                        Ctrl
                                    </kbd>
                                    <span className="text-xs text-gray-500">+</span>
                                    <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                        S
                                    </kbd>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Back</span>
                                <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                    B
                                </kbd>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Fullscreen</span>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                        F
                                    </kbd>
                                    <span className="text-xs text-gray-500">or</span>
                                    <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                        F11
                                    </kbd>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Cancel</span>
                                <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                    Esc
                                </kbd>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Show Help</span>
                                <kbd className="px-3 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                    Shift + ?
                                </kbd>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
