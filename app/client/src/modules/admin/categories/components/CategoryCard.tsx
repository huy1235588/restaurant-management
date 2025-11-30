'use client';

import Image from 'next/image';
import { Category } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { truncateText } from '../utils';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '@/lib/utils';

interface CategoryCardProps {
    category: Category;
    onEdit?: (category: Category) => void;
    onDelete?: (category: Category) => void;
    onViewDetails: (category: Category) => void;
}

export function CategoryCard({ category, onEdit, onDelete, onViewDetails }: CategoryCardProps) {
    const { t } = useTranslation();
    const itemCount = category.menuItems?.length || 0;

    return (
        <Card className="py-0 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
            <div className="relative aspect-video bg-muted transition-all duration-300 group-hover:brightness-110" onClick={() => onViewDetails(category)}>
                {getImageUrl(category.imagePath) ? (
                    <Image
                        src={getImageUrl(category.imagePath)!}
                        alt={category.categoryName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted to-muted-foreground/10">
                        <span className="text-4xl font-bold text-muted-foreground/30">
                            {category.categoryName.charAt(0)}
                        </span>
                    </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                        {category.isActive ? t('categories.active') : t('categories.inactive')}
                    </Badge>
                </div>
            </div>

            <CardContent className="px-4 py-0" onClick={() => onViewDetails(category)}>
                <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary">
                    {category.categoryName}
                </h3>
                <div className="min-h-10 mb-2">
                    {category.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {truncateText(category.description, 100)}
                        </p>
                    )}
                </div>
                <Badge variant="outline">
                    {itemCount} {itemCount === 1 ? t('common.item') : t('common.items')}
                </Badge>
            </CardContent>

            <CardFooter className="p-4 pt-0 pb-2 flex justify-between items-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(category);
                    }}
                >
                    <Eye className="w-4 h-4 mr-1" />
                    {t('common.viewItems')}
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(category)}>
                                <Edit className="w-4 h-4 mr-2" />
                                {t('common.edit')}
                            </DropdownMenuItem>
                        )}
                        {onDelete && (
                            <DropdownMenuItem
                                onClick={() => onDelete(category)}
                                className="text-destructive"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t('common.delete')}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
}
