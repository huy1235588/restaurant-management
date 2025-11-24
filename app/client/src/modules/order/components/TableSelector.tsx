'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAvailableTables } from '@/modules/tables/hooks';
import { Table } from '@/types';
import { Users, CheckCircle2, Loader2, MapPin, Building2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableSelectorProps {
    selectedTableId: number | null;
    onSelect: (tableId: number) => void;
    capacity?: number;
}

export function TableSelector({ selectedTableId, onSelect, capacity }: TableSelectorProps) {
    const { data: availableTables, isLoading } = useAvailableTables(capacity);

    const tables = useMemo(() => (availableTables as Table[] | undefined) || [], [availableTables]);

    // Group tables by floor and sort
    const tablesByFloor = useMemo(() => {
        const grouped = tables.reduce((acc, table) => {
            const floor = table.floor || 1;
            if (!acc[floor]) {
                acc[floor] = [];
            }
            acc[floor].push(table);
            return acc;
        }, {} as Record<number, Table[]>);

        // Sort tables within each floor by table number
        Object.keys(grouped).forEach((floor) => {
            grouped[Number(floor)].sort((a, b) => {
                const numA = parseInt(a.tableNumber.replace(/\D/g, '')) || 0;
                const numB = parseInt(b.tableNumber.replace(/\D/g, '')) || 0;
                return numA - numB;
            });
        });

        return grouped;
    }, [tables]);

    const floors = useMemo(() => {
        return Object.keys(tablesByFloor)
            .map(Number)
            .sort((a, b) => a - b);
    }, [tablesByFloor]);

    const [selectedFloor, setSelectedFloor] = useState<number>(floors[0] || 1);

    // Find the selected table details
    const selectedTable = useMemo(() => {
        return tables.find((table) => table.tableId === selectedTableId);
    }, [tables, selectedTableId]);

    return (
        <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="rounded-t-xl bg-linear-to-r from-primary/5 to-primary/10 border-b border-primary/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl">Chọn bàn</CardTitle>
                        <CardDescription>
                            {isLoading ? (
                                'Đang tải...'
                            ) : tables.length > 0 ? (
                                <>
                                    {tables.length} bàn trống
                                    {capacity && ` (phù hợp ${capacity} người)`}
                                </>
                            ) : (
                                'Không có bàn trống'
                            )}
                        </CardDescription>
                    </div>
                    {selectedTable && (
                        <div className="text-right shrink-0">
                            <Badge variant="default" className="bg-primary px-3 py-1.5 mb-1">
                                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                Bàn {selectedTable.tableNumber}
                            </Badge>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 justify-end mt-1">
                                <span className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    Tầng {selectedTable.floor}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {selectedTable.capacity} chỗ
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                            <p className="text-sm text-muted-foreground">
                                Đang kiểm tra bàn trống...
                            </p>
                        </div>
                    </div>
                ) : tables.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Info className="w-12 h-12 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                            Không có bàn trống
                            {capacity && ` cho ${capacity} người`}
                        </p>
                    </div>
                ) : floors.length > 1 ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-muted-foreground shrink-0" />
                            <Select value={String(selectedFloor)} onValueChange={(val) => setSelectedFloor(Number(val))}>
                                <SelectTrigger className="w-[200px] h-11">
                                    <SelectValue placeholder="Chọn tầng" />
                                </SelectTrigger>
                                <SelectContent>
                                    {floors.map((floor) => (
                                        <SelectItem key={floor} value={String(floor)}>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                Tầng {floor}
                                                <Badge variant="secondary" className="ml-1">
                                                    {tablesByFloor[floor].length}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-muted-foreground">
                                {tablesByFloor[selectedFloor]?.length || 0} bàn tại tầng này
                            </span>
                        </div>
                        <TableGrid
                            tables={tablesByFloor[selectedFloor] || []}
                            selectedTableId={selectedTableId}
                            onSelectTable={onSelect}
                        />
                    </div>
                ) : (
                    <TableGrid
                        tables={tables}
                        selectedTableId={selectedTableId}
                        onSelectTable={onSelect}
                    />
                )}
            </CardContent>
        </Card>
    );
}

interface TableGridProps {
    tables: Table[];
    selectedTableId: number | null;
    onSelectTable: (tableId: number) => void;
}

function TableGrid({ tables, selectedTableId, onSelectTable }: TableGridProps) {
    // Group by section if available
    const tablesBySection = useMemo(() => {
        const hasSection = tables.some((t) => t.section);
        if (!hasSection) {
            return { '': tables };
        }

        return tables.reduce((acc, table) => {
            const section = table.section || 'Khu vực chính';
            if (!acc[section]) {
                acc[section] = [];
            }
            acc[section].push(table);
            return acc;
        }, {} as Record<string, Table[]>);
    }, [tables]);

    const sections = Object.keys(tablesBySection);

    return (
        <div className="space-y-6">
            {sections.map((section) => (
                <div key={section}>
                    {section && (
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {section}
                        </h3>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {tablesBySection[section].map((table) => (
                            <TableCard
                                key={table.tableId}
                                table={table}
                                isSelected={selectedTableId === table.tableId}
                                onSelect={() => onSelectTable(table.tableId)}
                            />
                        ))}
                    </div>
                </div>
            ))}
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
            type="button"
            onClick={onSelect}
            className={cn(
                'relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'flex flex-col items-center justify-center',
                isSelected
                    ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105'
                    : 'bg-card border-border hover:bg-accent hover:border-primary/50'
            )}
        >
            {/* Table Number */}
            <div className="text-center mb-2">
                <div className={cn(
                    'text-2xl font-bold',
                    isSelected ? 'text-primary-foreground' : 'text-foreground'
                )}>
                    {table.tableNumber}
                </div>
                {table.tableName && (
                    <div className={cn(
                        'text-xs mt-1',
                        isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    )}>
                        {table.tableName}
                    </div>
                )}
            </div>

            {/* Capacity Info */}
            <div className={cn(
                'flex items-center justify-center gap-1 text-sm',
                isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground'
            )}>
                <Users className="w-4 h-4" />
                <span className="font-medium">{table.capacity}</span>
                {table.minCapacity > 1 && table.minCapacity !== table.capacity && (
                    <span className="text-xs">({table.minCapacity}+)</span>
                )}
            </div>

            {/* Section Badge */}
            {table.section && (
                <div className="mt-2">
                    <Badge
                        variant="secondary"
                        className={cn(
                            'text-xs px-2 py-0.5',
                            isSelected
                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                : 'bg-secondary text-secondary-foreground'
                        )}
                    >
                        {table.section}
                    </Badge>
                </div>
            )}

            {/* Selected Indicator */}
            {isSelected && (
                <div className="absolute -top-2 -right-2">
                    <div className="w-6 h-6 bg-background rounded-full flex items-center justify-center shadow-md ring-2 ring-primary">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                </div>
            )}
        </button>
    );
}
