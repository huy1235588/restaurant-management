'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { ArrowLeft, Edit, Trash2, Package } from 'lucide-react';
import {
    useCategoryWithItems,
    useUpdateCategory,
    useDeleteCategory,
    CategoryForm,
    useCategoryHandlers,
    formatDate,
} from '@/modules/admin/categories';
import { MenuItem } from '@/types';
import { MenuItemCard } from '@/modules/admin/menu/components/MenuItemCard';
import { getImageUrl } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function CategoryDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { t } = useTranslation();
    const categoryId = parseInt(id);

    const { category, loading, error, refetch } = useCategoryWithItems(categoryId);
    const { updateCategory, loading: updating } = useUpdateCategory();
    const { deleteCategory, loading: deleting } = useDeleteCategory();

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Category handlers
    const { handleUpdate, handleDelete: handleDeleteCategory } = useCategoryHandlers({
        onUpdateCategory: async (id, data) => {
            await updateCategory(id, data);
        },
        onDeleteCategory: async (id) => {
            await deleteCategory(id);
        },
        onUpdateSuccess: () => {
            setEditDialogOpen(false);
            refetch();
        },
        onDeleteSuccess: () => {
            router.push('/admin/categories');
        },
    });

    const handleUpdateFormSubmit = async (data: any, imageFile?: File | null) => {
        try {
            await handleUpdate(categoryId, category!, data, imageFile);
        } catch (error) {
            // Error already handled in hook
        }
    };

    const handleDeleteConfirm = async () => {
        if (!category) return;

        if (category.menuItems && category.menuItems.length > 0) {
            toast.error(
                t('categories.cannotDeleteWithItems')
            );
            return;
        }

        try {
            await handleDeleteCategory(categoryId, category);
        } catch (error) {
            // Error already handled in hook
        }
    };

    const handleViewMenuItem = (item: MenuItem) => {
        router.push(`/admin/menu/${item.itemId}`);
    };

    const handleEditMenuItem = (item: MenuItem) => {
        router.push(`/admin/menu?edit=${item.itemId}`);
    };

    const handleDeleteMenuItem = (item: MenuItem) => {
        // This would open a delete dialog in the parent
        toast.info(t('categories.manageFromMenuPage'));
    };

    const handleDuplicateMenuItem = (item: MenuItem) => {
        router.push(`/admin/menu?duplicate=${item.itemId}`);
    };

    const handleToggleAvailability = async (item: MenuItem, isAvailable: boolean) => {
        // This would call the availability API
        toast.info(t('categories.manageFromMenuPage'));
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
                        <Skeleton className="h-48 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="container mx-auto p-6">
                <Card className="p-12">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">{t('categories.categoryNotFound')}</h2>
                        <p className="text-muted-foreground mb-4">{error || t('categories.categoryDoesNotExist')}</p>
                        <Button onClick={() => router.push('/admin/categories')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('categories.backToCategories')}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const menuItems = category.menuItems || [];

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/admin/categories')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold">{category.categoryName}</h1>
                            <Badge variant={category.isActive ? 'default' : 'secondary'}>
                                {category.isActive ? t('categories.active') : t('categories.inactive')}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {menuItems.length} {menuItems.length === 1 ? t('common.item') : t('common.items')}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        {t('common.edit')}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                        disabled={menuItems.length > 0}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('common.delete')}
                    </Button>
                </div>
            </div>

            {/* Category Info */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            {getImageUrl(category.imagePath) ? (
                                <div className="relative aspect-video rounded-lg overflow-hidden">
                                    <Image
                                        src={getImageUrl(category.imagePath)!}
                                        alt={category.categoryName}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                                    <Package className="w-16 h-16 text-muted-foreground/30" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            {category.description && (
                                <div>
                                    <h3 className="font-semibold mb-1">{t('categories.description')}</h3>
                                    <p className="text-muted-foreground">{category.description}</p>
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold mb-1">{t('common.details')}</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('categories.displayOrder')}:</span>
                                        <span className="font-medium">{category.displayOrder || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('categories.createdAt')}:</span>
                                        <span className="font-medium">
                                            {formatDate(category.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('categories.updatedAt')}:</span>
                                        <span className="font-medium">
                                            {formatDate(category.updatedAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Menu Items */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>{t('categories.menuItems')}</span>
                        <Button onClick={() => router.push('/admin/menu')} size="sm">
                            {t('common.viewAll')}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {menuItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {menuItems.map((item) => (
                                <MenuItemCard
                                    key={item.itemId}
                                    item={item}
                                    onEdit={handleEditMenuItem}
                                    onDelete={handleDeleteMenuItem}
                                    onDuplicate={handleDuplicateMenuItem}
                                    onViewDetails={handleViewMenuItem}
                                    onToggleAvailability={handleToggleAvailability}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>{t('categories.noItemsInCategory')}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('categories.editCategory')}</DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                        category={category}
                        onSubmit={handleUpdateFormSubmit}
                        onCancel={() => setEditDialogOpen(false)}
                        loading={updating}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('categories.deleteCategory')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('categories.deleteConfirmDescription')}
                            <span className="block mt-2 font-medium">"{category.categoryName}"</span>
                            {menuItems.length > 0 ? (
                                <span className="block mt-2 text-destructive font-medium">
                                    {t('categories.cannotDeleteWithItems')}
                                </span>
                            ) : (
                                <span className="block mt-2">{t('common.actionCannotBeUndone')}</span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleting || menuItems.length > 0}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleting ? t('common.deleting') : t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
