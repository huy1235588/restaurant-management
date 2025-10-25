import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { UtensilsCrossed, Check, X, Tag } from 'lucide-react';
import { MenuItem, Category } from '@/types';

interface MenuStatsProps {
    menuItems: MenuItem[];
    categories: Category[];
}

export function MenuStats({ menuItems, categories }: MenuStatsProps) {
    const { t } = useTranslation();

    const stats = {
        total: menuItems.length,
        available: menuItems.filter(item => item.isAvailable).length,
        unavailable: menuItems.filter(item => !item.isAvailable).length,
        categories: categories.length,
    };

    const statItems = [
        {
            label: t('menu.totalItems', 'Total Items'),
            value: stats.total,
            icon: UtensilsCrossed,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            label: t('menu.available', 'Available'),
            value: stats.available,
            icon: Check,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            label: t('menu.unavailable', 'Unavailable'),
            value: stats.unavailable,
            icon: X,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
        {
            label: t('menu.categories', 'Categories'),
            value: stats.categories,
            icon: Tag,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statItems.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {stat.label}
                                    </p>
                                    <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                                </div>
                                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
