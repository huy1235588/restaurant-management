import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Users, Loader2, MapPin, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Table {
    tableId: number;
    tableNumber: string;
    tableName?: string;
    capacity: number;
    minCapacity: number;
    floor: number;
    section?: string;
}

interface TableSelectorProps {
    tables: Table[];
    loading?: boolean;
    selectedTableId?: number;
    onSelectTable: (tableId: number) => void;
    className?: string;
}

export function TableSelector({
    tables,
    loading = false,
    selectedTableId,
    onSelectTable,
    className,
}: TableSelectorProps) {
    // Group tables by floor
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

    if (tables.length === 0 && !loading) {
        return null;
    }

    return (
        <Card className={cn('pt-0 border-2 border-green-200 dark:border-green-700 shadow-lg', className)}>
            <CardHeader className="pt-6 rounded-t-xl bg-linear-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 border-b border-green-200 dark:border-green-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 dark:bg-green-500 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-xl">Available Tables</CardTitle>
                        <CardDescription>
                            {tables.length} table{tables.length !== 1 ? 's' : ''} available for your party
                        </CardDescription>
                    </div>
                    {selectedTable && (
                        <div className="text-right">
                            <Badge variant="default" className="bg-green-600 dark:bg-green-500 px-3 py-1.5 mb-1">
                                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                Table {selectedTable.tableNumber}
                            </Badge>
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2 justify-end mt-1">
                                <span className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    Floor {selectedTable.floor}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {selectedTable.capacity} seats
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-green-600" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Checking table availability...
                            </p>
                        </div>
                    </div>
                ) : floors.length > 1 ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-gray-500" />
                            <Select value={String(selectedFloor)} onValueChange={(val) => setSelectedFloor(Number(val))}>
                                <SelectTrigger className="w-[200px] h-11">
                                    <SelectValue placeholder="Select floor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {floors.map((floor) => (
                                        <SelectItem key={floor} value={String(floor)}>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                Floor {floor}
                                                <Badge variant="secondary" className="ml-1">
                                                    {tablesByFloor[floor].length}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {tablesByFloor[selectedFloor]?.length || 0} tables on this floor
                            </span>
                        </div>
                        <TableGrid
                            tables={tablesByFloor[selectedFloor] || []}
                            selectedTableId={selectedTableId}
                            onSelectTable={onSelectTable}
                        />
                    </div>
                ) : (
                    <TableGrid
                        tables={tables}
                        selectedTableId={selectedTableId}
                        onSelectTable={onSelectTable}
                    />
                )}
            </CardContent>
        </Card>
    );
}

interface TableGridProps {
    tables: Table[];
    selectedTableId?: number;
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
            const section = table.section || 'General';
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
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
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
                'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
                isSelected
                    ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-500/30 scale-105'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-300 dark:hover:border-green-600'
            )}
        >
            {/* Table Number */}
            <div className="text-center mb-2">
                <div
                    className={cn(
                        'text-2xl font-bold',
                        isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                    )}
                >
                    {table.tableNumber}
                </div>
                {table.tableName && (
                    <div
                        className={cn(
                            'text-xs mt-1',
                            isSelected ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                        )}
                    >
                        {table.tableName}
                    </div>
                )}
            </div>

            {/* Capacity Info */}
            <div
                className={cn(
                    'flex items-center justify-center gap-1 text-sm',
                    isSelected ? 'text-green-100' : 'text-gray-600 dark:text-gray-400'
                )}
            >
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
                                ? 'bg-green-700 text-green-100'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        )}
                    >
                        {table.section}
                    </Badge>
                </div>
            )}

            {/* Selected Indicator */}
            {isSelected && (
                <div className="absolute -top-2 -right-2">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                </div>
            )}
        </button>
    );
}
