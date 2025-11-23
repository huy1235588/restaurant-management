import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Users, Loader2, Building2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Table {
    id: number;
    tableNumber: string;
    capacity: number;
    floor: number;
    status: string;
}

interface TableSelectorProps {
    tables: Table[];
    selectedTableId?: number;
    onSelectTable: (tableId: number | undefined) => void;
    loading?: boolean;
    className?: string;
}

export function TableSelector({
    tables,
    selectedTableId,
    onSelectTable,
    loading = false,
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

    const handleTableClick = (tableId: number) => {
        if (selectedTableId === tableId) {
            onSelectTable(undefined); // Deselect if clicking the same table
        } else {
            onSelectTable(tableId);
        }
    };

    if (loading) {
        return (
            <Card className={cn('border-2 border-gray-200 dark:border-gray-700 shadow-lg', className)}>
                <CardContent className="py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Checking table availability...
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (tables.length === 0) {
        return (
            <Card className={cn('border-2 border-yellow-200 dark:border-yellow-700 shadow-lg', className)}>
                <CardContent className="py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <AlertCircle className="w-12 h-12 text-yellow-600 dark:text-yellow-500" />
                        <div className="text-center">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                No Tables Available
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Please select a different date/time or party size
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn('border-2 border-green-200 dark:border-green-700 shadow-lg', className)}>
            <CardHeader className="bg-linera-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 border-b border-green-200 dark:border-green-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 dark:bg-green-500 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-xl">Available Tables</CardTitle>
                        <CardDescription>
                            {tables.length} table{tables.length !== 1 ? 's' : ''} available for this reservation
                        </CardDescription>
                    </div>
                    {selectedTableId && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            Selected: Table {tables.find((t) => t.id === selectedTableId)?.tableNumber}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {floors.length > 1 ? (
                    <Tabs value={selectedFloor.toString()} onValueChange={(val) => setSelectedFloor(Number(val))}>
                        <TabsList className="grid w-full mb-6" style={{ gridTemplateColumns: `repeat(${floors.length}, minmax(0, 1fr))` }}>
                            {floors.map((floor) => (
                                <TabsTrigger
                                    key={floor}
                                    value={floor.toString()}
                                    className="flex items-center gap-2"
                                >
                                    <Building2 className="w-4 h-4" />
                                    Floor {floor}
                                    <Badge variant="outline" className="ml-1">
                                        {tablesByFloor[floor].length}
                                    </Badge>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {floors.map((floor) => (
                            <TabsContent key={floor} value={floor.toString()} className="mt-0">
                                <TableGrid
                                    tables={tablesByFloor[floor]}
                                    selectedTableId={selectedTableId}
                                    onTableClick={handleTableClick}
                                />
                            </TabsContent>
                        ))}
                    </Tabs>
                ) : (
                    <TableGrid
                        tables={tables}
                        selectedTableId={selectedTableId}
                        onTableClick={handleTableClick}
                    />
                )}

                {/* Optional: Show clear selection button */}
                {selectedTableId && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectTable(undefined)}
                            className="w-full"
                        >
                            Clear Selection
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface TableGridProps {
    tables: Table[];
    selectedTableId?: number;
    onTableClick: (tableId: number) => void;
}

function TableGrid({ tables, selectedTableId, onTableClick }: TableGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {tables.map((table) => {
                const isSelected = selectedTableId === table.id;

                return (
                    <button
                        key={table.id}
                        type="button"
                        onClick={() => onTableClick(table.id)}
                        className={cn(
                            'group relative p-4 border-2 rounded-xl text-sm font-semibold transition-all duration-200',
                            'hover:shadow-lg active:scale-95',
                            isSelected
                                ? 'bg-linear-to-br from-blue-600 to-blue-700 border-blue-600 text-white shadow-xl shadow-blue-500/30 scale-105'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                        )}
                    >
                        {/* Selection indicator */}
                        {isSelected && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                        )}

                        {/* Table number */}
                        <div className={cn(
                            'text-lg font-bold mb-2',
                            isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                        )}>
                            {table.tableNumber}
                        </div>

                        {/* Capacity */}
                        <div className={cn(
                            'flex items-center justify-center gap-1 text-xs',
                            isSelected
                                ? 'text-blue-100'
                                : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                        )}>
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-medium">{table.capacity} seats</span>
                        </div>

                        {/* Hover effect overlay */}
                        {!isSelected && (
                            <div className="absolute inset-0 rounded-xl bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
