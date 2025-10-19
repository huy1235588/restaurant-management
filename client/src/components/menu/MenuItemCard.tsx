import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface MenuItem {
    itemId: number;
    itemName: string;
    categoryId: number;
    category?: { categoryName: string };
    price: number;
    description?: string;
    imageUrl?: string;
    isAvailable: boolean;
    preparationTime?: number;
}

interface MenuItemCardProps {
    item: MenuItem;
    onEdit?: (itemId: number) => void;
    onToggleAvailability?: (itemId: number) => void;
    canManage?: boolean;
}

export function MenuItemCard({ item, onEdit, onToggleAvailability, canManage }: MenuItemCardProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative">
                {item.imageUrl && !imageError ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.itemName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <span className="text-4xl">🍽️</span>
                    </div>
                )}
                {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge variant="destructive" className="text-lg">
                            Unavailable
                        </Badge>
                    </div>
                )}
            </div>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{item.itemName}</CardTitle>
                        <CardDescription className="mt-1">
                            {item.category?.categoryName}
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2">
                        ${item.price.toFixed(2)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {item.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                        {item.description}
                    </p>
                )}
                {item.preparationTime && (
                    <div className="flex items-center text-xs text-muted-foreground mb-3">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.preparationTime} mins
                    </div>
                )}
                {canManage && (
                    <div className="flex gap-2">
                        {onEdit && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => onEdit(item.itemId)}
                            >
                                Edit
                            </Button>
                        )}
                        {onToggleAvailability && (
                            <Button
                                size="sm"
                                variant={item.isAvailable ? 'destructive' : 'default'}
                                className="flex-1"
                                onClick={() => onToggleAvailability(item.itemId)}
                            >
                                {item.isAvailable ? 'Disable' : 'Enable'}
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
