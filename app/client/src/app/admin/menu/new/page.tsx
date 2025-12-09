'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { MenuItemForm, useCreateMenuItem, useMenuItemHandlers } from '@/modules/admin/menu';
import { useCategories } from '@/modules/admin/categories';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/types/permissions';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function NewMenuItemPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    // Permission check
    const canCreate = user ? hasPermission(user.role, 'menu.create') : false;

    // Data fetching
    const { categories, loading: categoriesLoading } = useCategories({ isActive: true });
    const { createMenuItem } = useCreateMenuItem();

    const { handleCreate } = useMenuItemHandlers({
        onCreateMenuItem: async (data) => {
            await createMenuItem(data);
        },
        onCreateSuccess: () => {
            router.push('/admin/menu');
        },
    });

    const handleSubmit = async (data: any, imageFile?: File | null) => {
        setLoading(true);
        try {
            await handleCreate(data, imageFile);
        } catch (error: any) {
            // Error is handled in handleCreate
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    if (!canCreate) {
        return (
            <div className="container py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('common.errors.accessDenied')}</CardTitle>
                        <CardDescription>
                            {t('common.errors.noPermission')}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (categoriesLoading) {
        return (
            <div className="container py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8 max-w-5xl">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={handleCancel}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('common.back')}
                </Button>
                
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('menu.createItem')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('menu.form.sections.basicInfo.description')}
                    </p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <MenuItemForm
                        categories={categories}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        loading={loading}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
