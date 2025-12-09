'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit, Trash2, Copy, Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
    useMenuItem,
    useDeleteMenuItem,
} from '@/modules/admin/menu';

import {
    formatPrice,
    formatMargin,
    formatDate,
    formatPreparationTime,
    getSpicyLevelLabel,
    getSpicyLevelEmoji,
} from '@/modules/admin/menu/utils';
import { getImageUrl } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function MenuItemDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { t } = useTranslation();
    const itemId = parseInt(id);

    const { menuItem, loading, error } = useMenuItem(itemId);
    const { deleteMenuItem, loading: deleting } = useDeleteMenuItem();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Menu item handlers
    const handleDeleteConfirm = async () => {
        if (!menuItem) return;

        try {
            await deleteMenuItem(itemId);
            toast.success(t('menu.messages.deleteSuccess'));
            router.push('/admin/menu');
        } catch (error: any) {
            toast.error(error.message || t('menu.messages.deleteError'));
        }
    };

    const handleDuplicate = () => {
        router.push(`/admin/menu?duplicate=${itemId}`);
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-96 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !menuItem) {
        return (
            <div className="container mx-auto p-6">
                <Card className="p-12">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">{t('menu.menuItemNotFound')}</h2>
                        <p className="text-muted-foreground mb-4">
                            {error || t('menu.menuItemDoesNotExist')}
                        </p>
                        <Button onClick={() => router.push('/admin/menu')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('menu.backToMenu')}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/admin/menu')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold">{menuItem.itemName}</h1>
                            {/* TODO */}
                            {/* {menuItem.isVegetarian && <span className="text-2xl">🌱</span>}
                            {menuItem.spicyLevel != undefined && menuItem.spicyLevel > 0 && (
                                <span className="text-xl">
                                    {getSpicyLevelEmoji(menuItem.spicyLevel)}
                                </span>
                            )} */}
                        </div>
                        <p className="text-muted-foreground mt-1 font-mono">{menuItem.itemCode}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push(`/admin/menu/${itemId}/edit`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        {t('menu.edit')}
                    </Button>
                    <Button variant="outline" onClick={handleDuplicate}>
                        <Copy className="w-4 h-4 mr-2" />
                        {t('menu.duplicate')}
                    </Button>
                    <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('menu.delete')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Image and Basic Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            {getImageUrl(menuItem.imagePath) ? (
                                <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
                                    <Image
                                        src={getImageUrl(menuItem.imagePath)!}
                                        alt={menuItem.itemName}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 100vw, 66vw"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center mb-6">
                                    <Package className="w-16 h-16 text-muted-foreground/30" />
                                </div>
                            )}

                            {menuItem.description && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">{t('menu.description')}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {menuItem.description}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('menu.details')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {menuItem.preparationTime && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{t('menu.preparationTimeLabel')}</span>
                                    <span className="font-medium">
                                        {formatPreparationTime(menuItem.preparationTime)}
                                    </span>
                                </div>
                            )}
                            {menuItem.spicyLevel !== undefined && menuItem.spicyLevel !== null && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{t('menu.spicyLevelLabel')}</span>
                                    <span className="font-medium">
                                        {getSpicyLevelLabel(menuItem.spicyLevel)}
                                    </span>
                                </div>
                            )}
                            {menuItem.calories && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{t('menu.caloriesLabel')}</span>
                                    <span className="font-medium">{menuItem.calories} kcal</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{t('menu.displayOrder')}</span>
                                <span className="font-medium">{menuItem.displayOrder || 0}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{t('menu.created')}</span>
                                <span className="font-medium">{formatDate(menuItem.createdAt)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{t('menu.lastUpdated')}</span>
                                <span className="font-medium">{formatDate(menuItem.updatedAt)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Details Sidebar */}
                <div className="space-y-6">
                    {/* Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('menu.statusTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{t('menu.availabilityLabel')}</span>
                                <Badge variant={menuItem.isAvailable ? 'default' : 'destructive'}>
                                    {menuItem.isAvailable ? t('menu.available') : t('menu.outOfStock')}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{t('menu.activeLabel')}</span>
                                <Badge variant={menuItem.isActive ? 'default' : 'secondary'}>
                                    {menuItem.isActive ? t('menu.yes') : t('menu.no')}
                                </Badge>
                            </div>
                            {menuItem.category && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">{t('menu.categoryLabel')}</span>
                                    <Badge variant="outline">{menuItem.category.categoryName}</Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('menu.pricingTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{t('menu.sellingPrice')}</span>
                                <span className="text-lg font-bold text-primary">
                                    {formatPrice(menuItem.price)}
                                </span>
                            </div>
                            {menuItem.cost && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">{t('menu.costLabel')}</span>
                                        <span className="font-medium">{formatPrice(menuItem.cost)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">{t('menu.profitMarginLabel')}</span>
                                        <span className="font-bold text-green-600 dark:text-green-400">
                                            {formatMargin(menuItem.price, menuItem.cost)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('menu.deleteMenuItem')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('menu.deleteMenuItemConfirm', { itemName: menuItem.itemName })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleting ? t('menu.deleting') : t('menu.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
