'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Save, Loader2, Settings, MapPin, Clock, Share2, Image, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useSettings, useUpdateSettings } from '../hooks';
import { settingsFormSchema, SettingsFormValues } from '../utils/validation';
import {
    GeneralSettingsForm,
    ContactSettingsForm,
    OperatingHoursForm,
    SocialLinksForm,
    HighlightsForm,
    ImagesSettingsForm,
    BankConfigForm,
} from '../components';

export function SettingsView() {
    const { t } = useTranslation();
    const { settings, loading: loadingSettings, error: fetchError, refetch } = useSettings();
    const { updateSettings, loading: saving } = useUpdateSettings();

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            name: '',
            tagline: '',
            description: '',
            aboutTitle: '',
            aboutContent: '',
            address: '',
            phone: '',
            email: '',
            mapEmbedUrl: '',
            heroImage: '',
            aboutImage: '',
            logoUrl: '',
            operatingHours: [],
            socialLinks: [],
            highlights: [],
            bankConfig: {
                bankId: '',
                bankName: '',
                accountNo: '',
                accountName: '',
                template: 'compact2',
            },
        },
    });

    // Populate form with settings data
    useEffect(() => {
        if (settings) {
            form.reset({
                name: settings.name || '',
                tagline: settings.tagline || '',
                description: settings.description || '',
                aboutTitle: settings.aboutTitle || '',
                aboutContent: settings.aboutContent || '',
                address: settings.address || '',
                phone: settings.phone || '',
                email: settings.email || '',
                mapEmbedUrl: settings.mapEmbedUrl || '',
                heroImage: settings.heroImage || '',
                aboutImage: settings.aboutImage || '',
                logoUrl: settings.logoUrl || '',
                operatingHours: settings.operatingHours || [],
                socialLinks: settings.socialLinks || [],
                highlights: settings.highlights || [],
                bankConfig: settings.bankConfig || {
                    bankId: '',
                    bankName: '',
                    accountNo: '',
                    accountName: '',
                    template: 'compact2',
                },
            });
        }
    }, [settings, form]);

    const onSubmit = async (data: SettingsFormValues) => {
        try {
            await updateSettings({
                name: data.name,
                tagline: data.tagline || undefined,
                description: data.description || undefined,
                aboutTitle: data.aboutTitle || undefined,
                aboutContent: data.aboutContent || undefined,
                address: data.address || undefined,
                phone: data.phone || undefined,
                email: data.email || undefined,
                mapEmbedUrl: data.mapEmbedUrl || undefined,
                heroImage: data.heroImage || undefined,
                aboutImage: data.aboutImage || undefined,
                logoUrl: data.logoUrl || undefined,
                operatingHours: data.operatingHours,
                socialLinks: data.socialLinks,
                highlights: data.highlights,
                bankConfig: data.bankConfig?.bankId ? data.bankConfig : undefined,
            });
            toast.success(t('settings.saveSuccess'));
            refetch();
        } catch {
            toast.error(t('settings.saveError'));
        }
    };

    if (loadingSettings) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="container mx-auto py-6">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">
                            {t('settings.errorTitle')}
                        </CardTitle>
                        <CardDescription>{fetchError}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={refetch} variant="outline">
                            {t('common.retry')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {t('settings.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('settings.description')}
                    </p>
                </div>
                <Button
                    type="submit"
                    form="settings-form"
                    disabled={saving}
                >
                    {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    {t('settings.save')}
                </Button>
            </div>

            {/* Form */}
            <Form {...form}>
                <form id="settings-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <Tabs defaultValue="general" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="general" className="gap-2">
                                <Settings className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {t('settings.tabs.general')}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="contact" className="gap-2">
                                <MapPin className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {t('settings.tabs.contact')}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="hours" className="gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {t('settings.tabs.hours')}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="social" className="gap-2">
                                <Share2 className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {t('settings.tabs.social')}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="images" className="gap-2">
                                <Image className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {t('settings.tabs.images')}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="payment" className="gap-2">
                                <CreditCard className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {t('settings.tabs.payment', 'Thanh toán')}
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="general">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('settings.tabs.general')}</CardTitle>
                                    <CardDescription>
                                        {t('settings.generalDescription')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <GeneralSettingsForm form={form} />
                                    <div className="border-t pt-6">
                                        <HighlightsForm form={form} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="contact">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('settings.tabs.contact')}</CardTitle>
                                    <CardDescription>
                                        {t('settings.contactDescription')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ContactSettingsForm form={form} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="hours">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('settings.tabs.hours')}</CardTitle>
                                    <CardDescription>
                                        {t('settings.hoursDescription')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <OperatingHoursForm form={form} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="social">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('settings.tabs.social')}</CardTitle>
                                    <CardDescription>
                                        {t('settings.socialDescription')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SocialLinksForm form={form} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="images">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('settings.tabs.images')}</CardTitle>
                                    <CardDescription>
                                        {t('settings.imagesDescription')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ImagesSettingsForm form={form} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="payment">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('settings.tabs.payment', 'Thanh toán')}</CardTitle>
                                    <CardDescription>
                                        {t('settings.paymentDescription', 'Cấu hình thông tin thanh toán và mã QR chuyển khoản')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <BankConfigForm form={form} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </form>
            </Form>
        </div>
    );
}
