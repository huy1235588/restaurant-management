import { useState, useRef, useEffect } from 'react';
import { Table as TableType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TableStatusBadge } from './TableStatusBadge';
import { Users, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FloorPlanViewProps {
    tables: TableType[];
    loading: boolean;
    floorFilter: string;
    onEdit: (table: TableType) => void;
    onChangeStatus: (table: TableType) => void;
    onViewQR: (table: TableType) => void;
}

export function FloorPlanView({
    tables,
    loading,
    floorFilter,
    onEdit,
    onChangeStatus,
    onViewQR,
}: FloorPlanViewProps) {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
    const handleResetZoom = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0 && e.target === containerRef.current) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoom((prev) => Math.max(0.5, Math.min(2, prev + delta)));
        }
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(12)].map((_, index) => (
                    <Skeleton key={index} className="h-32 w-full" />
                ))}
            </div>
        );
    }

    if (tables.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">
                    {t('tables.noTablesFound', 'No tables found')}
                </p>
            </div>
        );
    }

    // Group tables by floor
    const groupedTables = tables.reduce((acc, table) => {
        const floor = table.floor || 0;
        if (!acc[floor]) {
            acc[floor] = [];
        }
        acc[floor].push(table);
        return acc;
    }, {} as Record<number, TableType[]>);

    const floorsToDisplay = floorFilter === 'all'
        ? Object.keys(groupedTables).sort()
        : [floorFilter];

    return (
        <div className="space-y-4">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 justify-end">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomOut}
                    title={t('tables.zoomOut', 'Zoom out')}
                >
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                    {Math.round(zoom * 100)}%
                </span>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomIn}
                    title={t('tables.zoomIn', 'Zoom in')}
                >
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleResetZoom}
                    title={t('tables.resetZoom', 'Reset zoom')}
                >
                    <Maximize2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Floor Plan Canvas */}
            <div
                ref={containerRef}
                className="relative overflow-hidden border rounded-lg bg-muted/30 min-h-[600px]"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                <div
                    className="space-y-8 p-8 transition-transform"
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: 'top left',
                    }}
                >
                    {floorsToDisplay.map((floor) => {
                const floorTables = groupedTables[parseInt(floor)] || [];
                if (floorTables.length === 0) return null;

                return (
                    <div key={floor}>
                        <h3 className="text-lg font-semibold mb-4">
                            {t('tables.floor', 'Floor')} {floor}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {floorTables.map((table) => (
                                <Card
                                    key={table.tableId}
                                    className="cursor-pointer hover:shadow-lg transition-shadow"
                                    onClick={() => onEdit(table)}
                                >
                                    <CardContent className="p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold">
                                                {table.tableNumber}
                                            </span>
                                            <TableStatusBadge status={table.status} />
                                        </div>
                                        {table.tableName && (
                                            <p className="text-sm text-muted-foreground truncate">
                                                {table.tableName}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {table.minCapacity && table.minCapacity !== table.capacity
                                                    ? `${table.minCapacity}-${table.capacity}`
                                                    : table.capacity}
                                            </span>
                                        </div>
                                        {table.section && (
                                            <p className="text-xs text-muted-foreground">
                                                {table.section}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            })}
                </div>
            </div>
        </div>
    );
}
