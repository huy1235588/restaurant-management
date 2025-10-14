'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Grid, List, QrCode } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useTableStore } from '@/stores/tableStore';
import { hasPermission, TableStatus } from '@/types';

const statusColors: Record<TableStatus, { bg: string; text: string }> = {
    available: { bg: 'bg-green-500', text: 'text-white' },
    occupied: { bg: 'bg-red-500', text: 'text-white' },
    reserved: { bg: 'bg-yellow-500', text: 'text-white' },
    maintenance: { bg: 'bg-gray-500', text: 'text-white' },
};

export default function TablesPage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const { tables } = useTableStore();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const canManageTables = user && hasPermission(user.role, 'tables.update');

    // Group tables by floor/section
    const tablesByFloor = tables.reduce((acc, table) => {
        const floor = table.floor || 0;
        if (!acc[floor]) acc[floor] = [];
        acc[floor].push(table);
        return acc;
    }, {} as Record<number, typeof tables>);

    const handleTableClick = (tableId: number) => {
        console.log('Table clicked:', tableId);
        // TODO: Show table details modal
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('tables.title') || 'Table Management'}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t('tables.subtitle') || 'Manage restaurant tables and seating'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tables.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {tables.filter((t) => t.status === 'available').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Occupied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {tables.filter((t) => t.status === 'occupied').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Reserved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {tables.filter((t) => t.status === 'reserved').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tables by Floor */}
            {Object.keys(tablesByFloor)
                .sort()
                .map((floor) => (
                    <div key={floor}>
                        <h2 className="text-xl font-semibold mb-4">
                            {floor === '0' ? 'Ground Floor' : `Floor ${floor}`}
                        </h2>

                        {viewMode === 'grid' ? (
                            <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
                                {tablesByFloor[Number(floor)].map((table) => (
                                    <Card
                                        key={table.tableId}
                                        className={`cursor-pointer hover:shadow-lg transition-all ${table.status === 'occupied'
                                                ? 'border-red-500 border-2'
                                                : table.status === 'reserved'
                                                    ? 'border-yellow-500 border-2'
                                                    : ''
                                            }`}
                                        onClick={() => handleTableClick(table.tableId)}
                                    >
                                        <CardContent className="p-6 text-center">
                                            <div
                                                className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold mb-3 ${statusColors[table.status].bg
                                                    } ${statusColors[table.status].text}`}
                                            >
                                                {table.tableNumber}
                                            </div>
                                            <p className="font-medium text-sm">
                                                {table.tableName || `Table ${table.tableNumber}`}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {table.capacity} seats
                                            </p>
                                            {table.currentOrder && (
                                                <Badge className="mt-2" variant="outline">
                                                    Order #{table.currentOrder.orderId}
                                                </Badge>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {tablesByFloor[Number(floor)].map((table) => (
                                    <Card
                                        key={table.tableId}
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => handleTableClick(table.tableId)}
                                    >
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${statusColors[table.status].bg
                                                        } ${statusColors[table.status].text}`}
                                                >
                                                    {table.tableNumber}
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {table.tableName || `Table ${table.tableNumber}`}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Capacity: {table.capacity} • {table.section || 'Main Area'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={statusColors[table.status].bg}>
                                                    {table.status}
                                                </Badge>
                                                {canManageTables && (
                                                    <Button size="sm" variant="outline">
                                                        <QrCode className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
        </div>
    );
}
