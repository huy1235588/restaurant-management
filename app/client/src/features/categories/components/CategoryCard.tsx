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

interface CategoryCardProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onViewDetails: (category: Category) => void;
}

export function CategoryCard({ category, onEdit, onDelete, onViewDetails }: CategoryCardProps) {
    const itemCount = category.menuItems?.length || 0;

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="relative aspect-video bg-muted" onClick={() => onViewDetails(category)}>
                {category.imageUrl ? (
                    <Image
                        src={category.imageUrl}
                        alt={category.categoryName}
                        fill
                        className="object-cover"
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
                        {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            </div>

            <CardContent className="p-4" onClick={() => onViewDetails(category)}>
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                    {category.categoryName}
                </h3>
                {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {truncateText(category.description, 100)}
                    </p>
                )}
                <Badge variant="outline" className="mt-2">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Badge>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(category);
                    }}
                >
                    <Eye className="w-4 h-4 mr-1" />
                    View Items
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(category)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(category)}
                            className="text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
}
