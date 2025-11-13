import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, Circle, AlertCircle, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TableStatsProps {
    stats: {
        total: number;
        available: number;
        occupied: number;
        reserved: number;
        maintenance: number;
    };
}

export function TableStats({ stats }: TableStatsProps) {
    const { t } = useTranslation();

    const statCards = [
        {
            title: t('tables.stats.total', 'Total Tables'),
            value: stats.total,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: t('tables.stats.available', 'Available'),
            value: stats.available,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: t('tables.stats.occupied', 'Occupied'),
            value: stats.occupied,
            icon: Circle,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
        },
        {
            title: t('tables.stats.reserved', 'Reserved'),
            value: stats.reserved,
            icon: AlertCircle,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
        },
        {
            title: t('tables.stats.maintenance', 'Maintenance'),
            value: stats.maintenance,
            icon: Wrench,
            color: 'text-gray-600',
            bgColor: 'bg-gray-100',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-5">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <div className={`p-2 rounded-full ${stat.bgColor}`}>
                                <Icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
