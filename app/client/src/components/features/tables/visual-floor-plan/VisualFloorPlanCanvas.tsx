'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Table, TableStatus } from '@/types';
import { useTranslation } from 'react-i18next';
import { VisualTableCard } from './VisualTableCard';
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    DragMoveEvent,
    useSensor,
    useSensors,
    PointerSensor,
    DragOverlay,
    useDraggable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

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
    rotation?: number;
}

interface AlignmentGuide {
    type: 'horizontal' | 'vertical';
    position: number;
    otherTableId: number;
}

const TABLE_WIDTH = 80;
const TABLE_HEIGHT = 80;
const SNAP_THRESHOLD = 10; // pixels
const ALIGNMENT_THRESHOLD = 5; // pixels for showing guides

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
    const [dragDelta, setDragDelta] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStartPos, setPanStartPos] = useState({ x: 0, y: 0 });
    const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
    const [activeId, setActiveId] = useState<number | null>(null);

    // Configure dnd-kit sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement required to start drag
            },
        })
    );

    // Initialize table positions based on database or default grid layout
    useEffect(() => {
        const positions = new Map<number, TablePosition>();
        tables.forEach((table, index) => {
            // Use database positions if available, otherwise default grid
            const col = index % 5;
            const row = Math.floor(index / 5);
            positions.set(table.tableId, {
                tableId: table.tableId,
                x: table.positionX ?? col * (TABLE_WIDTH + 40) + 60,
                y: table.positionY ?? row * (TABLE_HEIGHT + 40) + 60,
                width: table.width ?? TABLE_WIDTH,
                height: table.height ?? TABLE_HEIGHT,
                rotation: table.rotation ?? 0,
            });
        });
        setTablePositions(positions);
    }, [tables]);

    // Snap to grid helper function
    const snapToGrid = useCallback((value: number): number => {
        if (!showGrid) return value;
        return Math.round(value / gridSize) * gridSize;
    }, [showGrid, gridSize]);

    // Find alignment guides
    const findAlignmentGuides = useCallback((
        draggedId: number,
        newX: number,
        newY: number
    ): AlignmentGuide[] => {
        const guides: AlignmentGuide[] = [];
        const draggedPos = tablePositions.get(draggedId);
        if (!draggedPos) return guides;

        const draggedCenterX = newX + draggedPos.width / 2;
        const draggedCenterY = newY + draggedPos.height / 2;
        const draggedRight = newX + draggedPos.width;
        const draggedBottom = newY + draggedPos.height;

        tablePositions.forEach((otherPos, otherId) => {
            if (otherId === draggedId) return;

            const otherCenterX = otherPos.x + otherPos.width / 2;
            const otherCenterY = otherPos.y + otherPos.height / 2;
            const otherRight = otherPos.x + otherPos.width;
            const otherBottom = otherPos.y + otherPos.height;

            // Check horizontal alignment (center, top, bottom)
            if (Math.abs(draggedCenterY - otherCenterY) < ALIGNMENT_THRESHOLD) {
                guides.push({ type: 'horizontal', position: otherCenterY, otherTableId: otherId });
            } else if (Math.abs(newY - otherPos.y) < ALIGNMENT_THRESHOLD) {
                guides.push({ type: 'horizontal', position: otherPos.y, otherTableId: otherId });
            } else if (Math.abs(draggedBottom - otherBottom) < ALIGNMENT_THRESHOLD) {
                guides.push({ type: 'horizontal', position: otherBottom, otherTableId: otherId });
            }

            // Check vertical alignment (center, left, right)
            if (Math.abs(draggedCenterX - otherCenterX) < ALIGNMENT_THRESHOLD) {
                guides.push({ type: 'vertical', position: otherCenterX, otherTableId: otherId });
            } else if (Math.abs(newX - otherPos.x) < ALIGNMENT_THRESHOLD) {
                guides.push({ type: 'vertical', position: otherPos.x, otherTableId: otherId });
            } else if (Math.abs(draggedRight - otherRight) < ALIGNMENT_THRESHOLD) {
                guides.push({ type: 'vertical', position: otherRight, otherTableId: otherId });
            }
        });

        return guides;
    }, [tablePositions]);

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

    // Handle canvas panning
    const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
        if (activeTool === 'pan') {
            setIsPanning(true);
            setPanStartPos({ x: e.clientX, y: e.clientY });
        }
    }, [activeTool]);

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
        if (isPanning && activeTool === 'pan') {
            const deltaX = e.clientX - panStartPos.x;
            const deltaY = e.clientY - panStartPos.y;
            onPan(deltaX, deltaY);
            setPanStartPos({ x: e.clientX, y: e.clientY });
        }
    }, [isPanning, activeTool, panStartPos, onPan]);

    const handleCanvasMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    // DnD handlers
    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        const tableId = Number(active.id);
        
        if (activeTool !== 'select') return;
        
        setActiveId(tableId);
        setDraggingTableId(tableId);
        onTableSelect(tableId);
    }, [activeTool, onTableSelect]);

    const handleDragMove = useCallback((event: DragMoveEvent) => {
        if (!draggingTableId) return;

        const { delta } = event;
        setDragDelta({ x: delta.x / zoom, y: delta.y / zoom });

        // Calculate new position
        const pos = tablePositions.get(draggingTableId);
        if (!pos) return;

        let newX = pos.x + delta.x / zoom;
        let newY = pos.y + delta.y / zoom;

        // Apply grid snapping if enabled and not holding Ctrl
        if (showGrid && !event.active.data.current?.skipSnap) {
            newX = snapToGrid(newX);
            newY = snapToGrid(newY);
        }

        // Find and display alignment guides
        const guides = findAlignmentGuides(draggingTableId, newX, newY);
        setAlignmentGuides(guides);

        // Snap to alignment guides if close enough
        if (guides.length > 0) {
            const draggedPos = tablePositions.get(draggingTableId);
            if (draggedPos) {
                guides.forEach(guide => {
                    const otherPos = tablePositions.get(guide.otherTableId);
                    if (!otherPos) return;

                    if (guide.type === 'horizontal') {
                        // Snap to horizontal alignment
                        const draggedCenterY = newY + draggedPos.height / 2;
                        const otherCenterY = guide.position;
                        if (Math.abs(draggedCenterY - otherCenterY) < ALIGNMENT_THRESHOLD) {
                            newY = otherCenterY - draggedPos.height / 2;
                        }
                    } else {
                        // Snap to vertical alignment
                        const draggedCenterX = newX + draggedPos.width / 2;
                        const otherCenterX = guide.position;
                        if (Math.abs(draggedCenterX - otherCenterX) < ALIGNMENT_THRESHOLD) {
                            newX = otherCenterX - draggedPos.width / 2;
                        }
                    }
                });
            }
        }
    }, [draggingTableId, tablePositions, zoom, showGrid, snapToGrid, findAlignmentGuides]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, delta } = event;
        const tableId = Number(active.id);

        if (!delta || !tablePositions.has(tableId)) {
            setDraggingTableId(null);
            setActiveId(null);
            setAlignmentGuides([]);
            setDragDelta({ x: 0, y: 0 });
            return;
        }

        const pos = tablePositions.get(tableId);
        if (!pos) return;

        let newX = pos.x + delta.x / zoom;
        let newY = pos.y + delta.y / zoom;

        // Apply grid snapping
        if (showGrid && !event.active.data.current?.skipSnap) {
            newX = snapToGrid(newX);
            newY = snapToGrid(newY);
        }

        // Apply alignment snapping
        const guides = findAlignmentGuides(tableId, newX, newY);
        if (guides.length > 0) {
            guides.forEach(guide => {
                const otherPos = tablePositions.get(guide.otherTableId);
                if (!otherPos) return;

                if (guide.type === 'horizontal') {
                    const draggedCenterY = newY + pos.height / 2;
                    if (Math.abs(draggedCenterY - guide.position) < ALIGNMENT_THRESHOLD) {
                        newY = guide.position - pos.height / 2;
                    }
                } else {
                    const draggedCenterX = newX + pos.width / 2;
                    if (Math.abs(draggedCenterX - guide.position) < ALIGNMENT_THRESHOLD) {
                        newX = guide.position - pos.width / 2;
                    }
                }
            });
        }

        // Update position in state
        const newPositions = new Map(tablePositions);
        newPositions.set(tableId, {
            ...pos,
            x: newX,
            y: newY,
        });
        setTablePositions(newPositions);

        // Notify parent
        onTableMove(tableId, newX, newY);

        // Reset drag state
        setDraggingTableId(null);
        setActiveId(null);
        setAlignmentGuides([]);
        setDragDelta({ x: 0, y: 0 });
    }, [tablePositions, zoom, showGrid, snapToGrid, findAlignmentGuides, onTableMove]);

    const handleDragCancel = useCallback(() => {
        setDraggingTableId(null);
        setActiveId(null);
        setAlignmentGuides([]);
        setDragDelta({ x: 0, y: 0 });
    }, []);

    const getCursor = () => {
        if (activeTool === 'pan') return 'grab';
        if (isPanning) return 'grabbing';
        if (activeTool === 'delete') return 'not-allowed';
        if (draggingTableId) return 'grabbing';
        return 'default';
    };

    // Get the dragged table for overlay
    const draggedTable = activeId ? tables.find(t => t.tableId === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div
                ref={canvasRef}
                className="relative w-full h-full overflow-hidden bg-slate-50"
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
                        className="absolute inset-0 pointer-events-none z-10"
                    />
                )}

                {/* Alignment Guides */}
                {alignmentGuides.length > 0 && (
                    <div className="absolute inset-0 pointer-events-none z-20">
                        {alignmentGuides.map((guide, index) => {
                            if (guide.type === 'horizontal') {
                                return (
                                    <div
                                        key={`h-${index}`}
                                        className="absolute left-0 right-0 border-t-2 border-magenta-500"
                                        style={{
                                            top: `${guide.position * zoom + panY}px`,
                                        }}
                                    />
                                );
                            } else {
                                return (
                                    <div
                                        key={`v-${index}`}
                                        className="absolute top-0 bottom-0 border-l-2 border-cyan-500"
                                        style={{
                                            left: `${guide.position * zoom + panX}px`,
                                        }}
                                    />
                                );
                            }
                        })}
                    </div>
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

                        const isDragging = table.tableId === draggingTableId;
                        const draggedX = isDragging ? pos.x + dragDelta.x : pos.x;
                        const draggedY = isDragging ? pos.y + dragDelta.y : pos.y;

                        return (
                            <DraggableTableCard
                                key={table.tableId}
                                table={table}
                                position={{ x: draggedX, y: draggedY, width: pos.width, height: pos.height }}
                                isSelected={selectedTableId === table.tableId}
                                isDragging={isDragging}
                                disabled={activeTool !== 'select'}
                                onEdit={onEdit}
                                onChangeStatus={onChangeStatus}
                                onViewQR={onViewQR}
                                onSelect={() => onTableSelect(table.tableId)}
                            />
                        );
                    })}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-30">
                        <div className="bg-background rounded-lg p-4 shadow-lg">
                            <p className="text-sm font-medium">{t('common.loading', 'Loading...')}</p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && tables.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center z-30">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">
                                {t('tables.noTablesFound', 'No tables found')}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
                {draggedTable && (
                    <div className="opacity-80">
                        <VisualTableCard
                            table={draggedTable}
                            isSelected={true}
                            isDragging={true}
                            onEdit={onEdit}
                            onChangeStatus={onChangeStatus}
                            onViewQR={onViewQR}
                        />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}

// Draggable Table Card wrapper component
interface DraggableTableCardProps {
    table: Table;
    position: { x: number; y: number; width: number; height: number };
    isSelected: boolean;
    isDragging: boolean;
    disabled: boolean;
    onEdit: (table: Table) => void;
    onChangeStatus: (table: Table) => void;
    onViewQR: (table: Table) => void;
    onSelect: () => void;
}

function DraggableTableCard({
    table,
    position,
    isSelected,
    isDragging,
    disabled,
    onEdit,
    onChangeStatus,
    onViewQR,
    onSelect,
}: DraggableTableCardProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: table.tableId,
        disabled,
    });

    const style = {
        position: 'absolute' as const,
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        cursor: disabled ? 'default' : 'move',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={onSelect}
        >
            <VisualTableCard
                table={table}
                isSelected={isSelected}
                isDragging={isDragging}
                onEdit={onEdit}
                onChangeStatus={onChangeStatus}
                onViewQR={onViewQR}
            />
        </div>
    );
}
