'use client';

import { Category } from '@/types';
import { CategoryCard } from '../components/CategoryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { AlertCircle, PackageX } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

interface CategoryListProps {
    categories: Category[];
    loading: boolean;
    error: string | null;
    onEdit?: (category: Category) => void;
    onDelete?: (category: Category) => void;
    onViewDetails: (category: Category) => void;
}

export function CategoryList({
    categories,
    loading,
    error,
    onEdit,
    onDelete,
    onViewDetails,
}: CategoryListProps) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                        <Skeleton className="aspect-video w-full" />
                        <div className="p-4 space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('common.error')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (categories.length === 0) {
        return (
            <Card className="p-12">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <PackageX className="w-16 h-16 text-muted-foreground/50" />
                    <div>
                        <h3 className="text-lg font-semibold mb-1">{t('categories.noCategories')}</h3>
                        <p className="text-sm text-muted-foreground">
                            {t('categories.noCategoriesDescription')}
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
                <CategoryCard
                    key={category.categoryId}
                    category={category}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewDetails={onViewDetails}
                />
            ))}
        </div>
    );
}
