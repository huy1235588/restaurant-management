'use client';

import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAvailableTables } from '@/modules/tables/hooks';
import { Table } from '@/types';
import { Users, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableSelectorProps {
    selectedTableId: number | null;
    onSelect: (tableId: number) => void;
    capacity?: number;
}

export function TableSelector({ selectedTableId, onSelect, capacity }: TableSelectorProps) {
    const { data: availableTables, isLoading } = useAvailableTables(capacity);

    if (isLoading) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Đang tải danh sách bàn...
            </div>
        );
    }

    const tables = (availableTables as Table[] | undefined) || [];

    if (tables.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Không có bàn trống
            </div>
        );
    }

    // Group tables by floor
    const tablesByFloor = tables.reduce((acc: Record<number, Table[]>, table: Table) => {
        const floor = table.floor || 1;
        if (!acc[floor]) acc[floor] = [];
        acc[floor].push(table);
        return acc;
    }, {} as Record<number, Table[]>);

    const floors = Object.keys(tablesByFloor).sort((a, b) => Number(a) - Number(b));

    return (
        <div className="space-y-4">
            {floors.length > 1 ? (
                <Tabs defaultValue={floors[0]} className="w-full">
                    <TabsList className="w-full justify-start">
                        {floors.map((floor) => (
                            <TabsTrigger key={floor} value={floor}>
                                Tầng {floor}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {floors.map((floor) => (
                        <TabsContent key={floor} value={floor}>
                            <ScrollArea className="h-[400px]">
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
                                    {tablesByFloor[Number(floor)].map((table) => (
                                        <TableCard
                                            key={table.tableId}
                                            table={table}
                                            isSelected={table.tableId === selectedTableId}
                                            onSelect={() => onSelect(table.tableId)}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    ))}
                </Tabs>
            ) : (
                <ScrollArea className="h-[400px]">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
                        {tables.map((table) => (
                            <TableCard
                                key={table.tableId}
                                table={table}
                                isSelected={table.tableId === selectedTableId}
                                onSelect={() => onSelect(table.tableId)}
                            />
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
}

interface TableCardProps {
    table: Table;
    isSelected: boolean;
    onSelect: () => void;
}

function TableCard({ table, isSelected, onSelect }: TableCardProps) {
    return (
        <button
            onClick={onSelect}
            className={cn(
                'relative p-4 rounded-lg border-2 transition-all hover:shadow-md',
                'flex flex-col items-center justify-center gap-2',
                isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
            )}
        >
            {isSelected && (
                <CheckCircle2 className="absolute top-1 right-1 h-4 w-4 text-primary" />
            )}
            <div className="text-lg font-bold">
                {table.tableNumber}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{table.capacity}</span>
            </div>
            {table.section && (
                <Badge variant="outline" className="text-xs">
                    {table.section}
                </Badge>
            )}
        </button>
    );
}
