'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Table, TableStatus } from '@/types';
import { useTranslation } from 'react-i18next';
import { VisualTableCard } from './VisualTableCard';

interface VisualFloorPlanCanvasProps {
    tables: Table[];
    selectedTableId: number | null;
    activeTool: 'select' | 'pan' | 'add' | 'delete' | 'zoom-in' | 'zoom-out' | 'grid';
    zoom: number;
    panX: number;
    panY: number;
    gridSize: number;
    showGrid: boolean;
    loading: boolean;
    onTableSelect: (tableId: number | null) => void;
    onTableMove: (tableId: number, x: number, y: number) => void;
    onPan: (deltaX: number, deltaY: number) => void;
    onEdit: (table: Table) => void;
    onChangeStatus: (table: Table) => void;
    onViewQR: (table: Table) => void;
}

interface TablePosition {
    tableId: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

const TABLE_WIDTH = 80;
const TABLE_HEIGHT = 80;

/**
 * Visual Floor Plan Canvas - Main canvas for displaying and editing table positions
 */
export function VisualFloorPlanCanvas({
    tables,
    selectedTableId,
    activeTool,
    zoom,
    panX,
    panY,
    gridSize,
    showGrid,
    loading,
    onTableSelect,
    onTableMove,
    onPan,
    onEdit,
    onChangeStatus,
    onViewQR,
}: VisualFloorPlanCanvasProps) {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLDivElement>(null);
    const canvasElementRef = useRef<HTMLCanvasElement>(null);
    const [tablePositions, setTablePositions] = useState<Map<number, TablePosition>>(new Map());
    const [draggingTableId, setDraggingTableId] = useState<number | null>(null);
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStartPos, setPanStartPos] = useState({ x: 0, y: 0 });

    // Initialize table positions based on database or default grid layout
    useEffect(() => {
        const positions = new Map<number, TablePosition>();
        tables.forEach((table, index) => {
            const col = index % 5;
            const row = Math.floor(index / 5);
            positions.set(table.tableId, {
                tableId: table.tableId,
                x: col * (TABLE_WIDTH + 40) + 60,
                y: row * (TABLE_HEIGHT + 40) + 60,
                width: TABLE_WIDTH,
                height: TABLE_HEIGHT,
            });
        });
        setTablePositions(positions);
    }, [tables]);

    // Draw grid on canvas
    useEffect(() => {
        if (!canvasElementRef.current || !showGrid) return;

        const canvas = canvasElementRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        canvas.width = rect.width;
        canvas.height = rect.height;

        // Clear canvas with background color (will use CSS for actual background)
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)';
        ctx.lineWidth = 1;

        const effectiveGridSize = gridSize * zoom;
        const startX = -(panX % effectiveGridSize);
        const startY = -(panY % effectiveGridSize);

        for (let x = startX; x < canvas.width; x += effectiveGridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        for (let y = startY; y < canvas.height; y += effectiveGridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }, [showGrid, zoom, panX, panY, gridSize]);

    const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
        if (activeTool === 'pan') {
            setIsPanning(true);
            setPanStartPos({ x: e.clientX, y: e.clientY });
        } else if (activeTool === 'select') {
            // Click on canvas deselects
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect && e.target === canvasRef.current) {
                onTableSelect(null);
            }
        }
    }, [activeTool, onTableSelect]);

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
        if (isPanning && (activeTool === 'pan' || e.button === 2)) {
            const deltaX = e.clientX - panStartPos.x;
            const deltaY = e.clientY - panStartPos.y;
            onPan(deltaX, deltaY);
            setPanStartPos({ x: e.clientX, y: e.clientY });
        }
    }, [isPanning, activeTool, panStartPos, onPan]);

    const handleCanvasMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    const handleTableMouseDown = useCallback((e: React.MouseEvent, tableId: number) => {
        e.stopPropagation();

        if (activeTool === 'select') {
            onTableSelect(tableId);
            setDraggingTableId(tableId);
            setDragStartPos({ x: e.clientX, y: e.clientY });
        } else if (activeTool === 'delete') {
            // TODO: Implement delete logic
            e.preventDefault();
        }
    }, [activeTool, onTableSelect]);

    const handleTableMouseMove = useCallback((e: React.MouseEvent) => {
        if (draggingTableId === null || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const deltaX = e.clientX - dragStartPos.x;
        const deltaY = e.clientY - dragStartPos.y;

        const pos = tablePositions.get(draggingTableId);
        if (pos) {
            const newX = pos.x + deltaX / zoom;
            const newY = pos.y + deltaY / zoom;

            // Update position
            const newPositions = new Map(tablePositions);
            newPositions.set(draggingTableId, {
                ...pos,
                x: newX,
                y: newY,
            });
            setTablePositions(newPositions);
            onTableMove(draggingTableId, newX, newY);
        }

        setDragStartPos({ x: e.clientX, y: e.clientY });
    }, [draggingTableId, dragStartPos, tablePositions, zoom, onTableMove]);

    const handleTableMouseUp = useCallback(() => {
        setDraggingTableId(null);
    }, []);

    // Add event listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('mousemove', handleTableMouseMove as any);
        canvas.addEventListener('mouseup', handleTableMouseUp);
        window.addEventListener('mouseup', handleTableMouseUp);

        return () => {
            canvas.removeEventListener('mousemove', handleTableMouseMove as any);
            canvas.removeEventListener('mouseup', handleTableMouseUp);
            window.removeEventListener('mouseup', handleTableMouseUp);
        };
    }, [handleTableMouseMove, handleTableMouseUp]);

    const getCursor = () => {
        if (activeTool === 'pan') return 'grab';
        if (isPanning) return 'grabbing';
        if (activeTool === 'delete') return 'not-allowed';
        return 'default';
    };

    return (
        <div
            ref={canvasRef}
            className="relative w-full h-full overflow-hidden bg-slate-500"
            style={{ cursor: getCursor() }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
        >
            {/* Grid Canvas */}
            {showGrid && (
                <canvas
                    ref={canvasElementRef}
                    className="absolute inset-0 pointer-events-none"
                />
            )}

            {/* Tables Container */}
            <div
                className="absolute"
                style={{
                    transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                    transition: draggingTableId ? 'none' : 'transform 0.1s ease-out',
                }}
            >
                {tables.map(table => {
                    const pos = tablePositions.get(table.tableId);
                    if (!pos) return null;

                    return (
                        <div
                            key={table.tableId}
                            style={{
                                position: 'absolute',
                                left: `${pos.x}px`,
                                top: `${pos.y}px`,
                                width: `${pos.width}px`,
                                height: `${pos.height}px`,
                            }}
                            onMouseDown={(e) => handleTableMouseDown(e, table.tableId)}
                        >
                            <VisualTableCard
                                table={table}
                                isSelected={selectedTableId === table.tableId}
                                isDragging={draggingTableId === table.tableId}
                                onEdit={onEdit}
                                onChangeStatus={onChangeStatus}
                                onViewQR={onViewQR}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <div className="bg-background rounded-lg p-4 shadow-lg">
                        <p className="text-sm font-medium">{t('common.loading', 'Loading...')}</p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && tables.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                            {t('tables.noTablesFound', 'No tables found')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
