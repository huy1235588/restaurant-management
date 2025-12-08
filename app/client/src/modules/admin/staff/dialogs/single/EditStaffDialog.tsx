'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Staff, ALL_ROLES, UpdateStaffData } from '../../types';
import { updateStaffSchema, UpdateStaffFormValues } from '../../utils/validation';
import { useUpdateStaff } from '../../hooks';
import { toast } from 'sonner';

interface EditStaffDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staff: Staff | null;
    onSuccess: () => void;
}

export function EditStaffDialog({
    open,
    onOpenChange,
    staff,
    onSuccess,
}: EditStaffDialogProps) {
    const { t } = useTranslation();
    const { updateStaff, loading } = useUpdateStaff();

    const form = useForm<UpdateStaffFormValues>({
        resolver: zodResolver(updateStaffSchema),
        defaultValues: {
            fullName: '',
            address: '',
            dateOfBirth: '',
            hireDate: '',
            salary: undefined,
            role: 'waiter',
        },
    });

    // Populate form when staff changes
    useEffect(() => {
        if (staff && open) {
            form.reset({
                fullName: staff.fullName,
                address: staff.address || '',
                dateOfBirth: staff.dateOfBirth ? new Date(staff.dateOfBirth).toISOString().split('T')[0] : '',
                hireDate: staff.hireDate ? new Date(staff.hireDate).toISOString().split('T')[0] : '',
                salary: staff.salary || undefined,
                role: staff.role,
            });
        }
    }, [staff, open, form]);

    const onSubmit = async (data: UpdateStaffFormValues) => {
        if (!staff) return;

        try {
            const updateData: UpdateStaffData = {
                fullName: data.fullName,
                address: data.address || undefined,
                dateOfBirth: data.dateOfBirth || undefined,
                hireDate: data.hireDate || undefined,
                salary: data.salary || undefined,
                role: data.role,
            };
            
            await updateStaff(staff.staffId, updateData);
            toast.success(t('staff.updateSuccess'));
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || t('common.error'));
        }
    };

    if (!staff) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('staff.editStaff')}</DialogTitle>
                    <DialogDescription>
                        {t('staff.editStaffDescription')}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Full Name */}
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('staff.fullName')} *</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder={t('staff.fullNamePlaceholder')}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Role */}
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('staff.role')} *</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('staff.selectRole')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ALL_ROLES.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {t(`roles.${role}`)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Address */}
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('staff.address')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={field.value || ''}
                                            placeholder={t('staff.addressPlaceholder')}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {/* Date of Birth */}
                            <FormField
                                control={form.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('staff.dateOfBirth')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Hire Date */}
                            <FormField
                                control={form.control}
                                name="hireDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('staff.hireDate')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Salary */}
                        <FormField
                            control={form.control}
                            name="salary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('staff.salary')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value ? Number(e.target.value) : undefined
                                                )
                                            }
                                            placeholder={t('staff.salaryPlaceholder')}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {t('common.save')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
