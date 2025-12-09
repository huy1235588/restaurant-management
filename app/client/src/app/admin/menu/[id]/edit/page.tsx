'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { MenuItemForm, useMenuItem, useUpdateMenuItem, useMenuItemHandlers } from '@/modules/admin/menu';
import { useCategories } from '@/modules/admin/categories';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/types/permissions';
import { useTranslation } from 'react-i18next';

export default function EditMenuItemPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    // Permission check
    const canUpdate = user ? hasPermission(user.role, 'menu.update') : false;

    // Data fetching
    const { menuItem, loading: menuItemLoading, error } = useMenuItem(Number(id));
    const { categories, loading: categoriesLoading } = useCategories({ isActive: true });
    const { updateMenuItem } = useUpdateMenuItem();

    const { handleUpdate } = useMenuItemHandlers({
        onUpdateMenuItem: async (itemId, data) => {
            await updateMenuItem(itemId, data);
        },
        onUpdateSuccess: () => {
            router.push(`/admin/menu/${id}`);
        },
    });

    const handleSubmit = async (data: any, imageFile?: File | null) => {
        if (!menuItem) return;
        
        setLoading(true);
        try {
            await handleUpdate(Number(id), menuItem, data, imageFile);
        } catch (error: any) {
            // Error is handled in handleUpdate
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    if (!canUpdate) {
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

    if (menuItemLoading || categoriesLoading) {
        return (
            <div className="container py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !menuItem) {
        return (
            <div className="container py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('common.errors.notFound')}</CardTitle>
                        <CardDescription>
                            {t('menu.messages.menuItemNotFound')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/admin/menu')}>
                            {t('common.buttons.backToList')}
                        </Button>
                    </CardContent>
                </Card>
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
                        {t('menu.editDescription')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('menu.form.sections.basicInfo.description')}
                    </p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <MenuItemForm
                        menuItem={menuItem}
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
