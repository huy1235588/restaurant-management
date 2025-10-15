import { QrCode } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableStatus } from '@/types';

const statusColors: Record<TableStatus, { bg: string; text: string }> = {
    available: { bg: 'bg-green-500', text: 'text-white' },
    occupied: { bg: 'bg-red-500', text: 'text-white' },
    reserved: { bg: 'bg-yellow-500', text: 'text-white' },
    maintenance: { bg: 'bg-gray-500', text: 'text-white' },
};

interface Table {
    tableId: number;
    tableNumber: string;
    tableName?: string;
    capacity: number;
    status: TableStatus;
    section?: string;
    currentOrder?: {
        orderId: number;
    };
}

interface TableCardProps {
    table: Table;
    viewMode: 'grid' | 'list';
    onClick: (tableId: number) => void;
    canManage?: boolean;
}

export function TableCard({ table, viewMode, onClick, canManage }: TableCardProps) {
    if (viewMode === 'grid') {
        return (
            <Card
                className={`cursor-pointer hover:shadow-lg transition-all ${
                    table.status === 'occupied'
                        ? 'border-red-500 border-2'
                        : table.status === 'reserved'
                        ? 'border-yellow-500 border-2'
                        : ''
                }`}
                onClick={() => onClick(table.tableId)}
            >
                <CardContent className="p-6 text-center">
                    <div
                        className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold mb-3 ${
                            statusColors[table.status].bg
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
        );
    }

    return (
        <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onClick(table.tableId)}
        >
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                            statusColors[table.status].bg
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
                    {canManage && (
                        <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                            <QrCode className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
