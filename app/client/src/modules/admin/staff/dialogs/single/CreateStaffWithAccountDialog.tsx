'use client';

import { useEffect, useState } from 'react';
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
    FormDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, KeyRound, Briefcase, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ALL_ROLES, CreateStaffWithAccountData } from '../../types';
import { createStaffWithAccountSchema, CreateStaffWithAccountFormValues } from '../../utils/validation';
import { useCreateStaffWithAccount } from '../../hooks';
import { toast } from 'sonner';

interface CreateStaffWithAccountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateStaffWithAccountDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateStaffWithAccountDialogProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('account');
    const [showPassword, setShowPassword] = useState(false);

    const { createStaffWithAccount, loading } = useCreateStaffWithAccount();

    const form = useForm<CreateStaffWithAccountFormValues>({
        resolver: zodResolver(createStaffWithAccountSchema),
        defaultValues: {
            // Account info
            username: '',
            email: '',
            password: '',
            phoneNumber: '',
            // Staff info
            fullName: '',
            address: '',
            dateOfBirth: '',
            hireDate: new Date().toISOString().split('T')[0],
            salary: undefined,
            role: 'waiter',
        },
    });

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            form.reset({
                username: '',
                email: '',
                password: '',
                phoneNumber: '',
                fullName: '',
                address: '',
                dateOfBirth: '',
                hireDate: new Date().toISOString().split('T')[0],
                salary: undefined,
                role: 'waiter',
            });
            setActiveTab('account');
            setShowPassword(false);
        }
    }, [open, form]);

    const onSubmit = async (data: CreateStaffWithAccountFormValues) => {
        try {
            const createData: CreateStaffWithAccountData = {
                username: data.username,
                email: data.email,
                password: data.password,
                phoneNumber: data.phoneNumber,
                fullName: data.fullName,
                address: data.address || undefined,
                dateOfBirth: data.dateOfBirth || undefined,
                hireDate: data.hireDate || undefined,
                salary: data.salary || undefined,
                role: data.role,
            };
            await createStaffWithAccount(createData);
            toast.success(t('staff.createWithAccountSuccess'));
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || t('common.error'));
        }
    };

    // Check if account tab is valid
    const accountFields = form.watch(['username', 'email', 'password', 'phoneNumber']);
    const isAccountTabValid = accountFields.every((field) => field && field.length > 0);

    // Check if staff tab is valid
    const staffFields = form.watch(['fullName', 'role']);
    const isStaffTabValid = staffFields.every((field) => field && field.length > 0);

    const handleNextTab = () => {
        if (activeTab === 'account') {
            setActiveTab('staff');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('staff.createStaffWithAccount')}</DialogTitle>
                    <DialogDescription>
                        {t('staff.createStaffWithAccountDescription')}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="account" className="flex items-center gap-2">
                                    <KeyRound className="w-4 h-4" />
                                    {t('staff.accountInfo')}
                                </TabsTrigger>
                                <TabsTrigger value="staff" className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    {t('staff.staffInfo')}
                                </TabsTrigger>
                            </TabsList>

                            {/* Account Information Tab */}
                            <TabsContent value="account" className="space-y-4 mt-4">
                                {/* Username */}
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('staff.username')} *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder={t('staff.usernamePlaceholder')}
                                                    autoComplete="off"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {t('staff.usernameHint')}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Email */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('staff.email')} *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="email"
                                                    placeholder={t('staff.emailPlaceholder')}
                                                    autoComplete="off"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Password */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('staff.password')} *</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder={t('staff.passwordPlaceholder')}
                                                        autoComplete="new-password"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                {t('staff.passwordHint')}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Phone Number */}
                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('staff.phoneNumber')} *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder={t('staff.phoneNumberPlaceholder')}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="button"
                                        onClick={handleNextTab}
                                        disabled={!isAccountTabValid}
                                    >
                                        {t('common.next')}
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* Staff Information Tab */}
                            <TabsContent value="staff" className="space-y-4 mt-4">
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
                                                        <SelectValue
                                                            placeholder={t('staff.selectRole')}
                                                        />
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
                                                            e.target.value
                                                                ? Number(e.target.value)
                                                                : undefined
                                                        )
                                                    }
                                                    placeholder={t('staff.salaryPlaceholder')}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !isAccountTabValid || !isStaffTabValid}
                            >
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {t('staff.createStaffWithAccountBtn')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
