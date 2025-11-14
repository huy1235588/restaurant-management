'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Table, TableStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { VisualFloorPlanCanvas } from './visual-floor-plan/VisualFloorPlanCanvas';
import { EditorToolbar } from './visual-floor-plan/EditorToolbar';
import { PropertiesPanel } from './visual-floor-plan/PropertiesPanel';
import { SaveLayoutDialog } from './visual-floor-plan/SaveLayoutDialog';
import { LoadLayoutDialog } from './visual-floor-plan/LoadLayoutDialog';
import { ActionHistory } from '@/lib/visual-floor-plan/action-history';
import { floorPlanApi, FloorPlanLayout } from '@/services/floor-plan.service';

interface VisualFloorPlanViewProps {
    tables: Table[];
    loading: boolean;
    floorFilter: string;
    onEdit: (table: Table) => void;
    onChangeStatus: (table: Table) => void;
    onViewQR: (table: Table) => void;
    onAssignOrder?: (table: Table) => void;
}

type EditorTool = 'select' | 'pan' | 'add' | 'delete' | 'zoom-in' | 'zoom-out' | 'grid';

interface CanvasState {
    zoom: number;
    panX: number;
    panY: number;
    gridSize: number;
    showGrid: boolean;
}

export function VisualFloorPlanView({
    tables,
    loading,
    floorFilter,
    onEdit,
    onChangeStatus,
    onViewQR,
    onAssignOrder,
}: VisualFloorPlanViewProps) {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLDivElement>(null);
    const historyRef = useRef(new ActionHistory());

    // Editor state
    const [activeTool, setActiveTool] = useState<EditorTool>('select');
    const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
    const [canvasState, setCanvasState] = useState<CanvasState>({
        zoom: 1,
        panX: 0,
        panY: 0,
        gridSize: 20,
        showGrid: true, // Default to true for easier layout
    });
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [tablePositions, setTablePositions] = useState<Map<number, { x: number; y: number }>>(new Map());
    const [showSaveLayoutDialog, setShowSaveLayoutDialog] = useState(false);
    const [showLoadLayoutDialog, setShowLoadLayoutDialog] = useState(false);
    const [savedLayouts, setSavedLayouts] = useState<FloorPlanLayout[]>([]);
    const [layoutsLoading, setLayoutsLoading] = useState(false);

    // Filter tables by floor
    const filteredTables = floorFilter !== 'all'
        ? tables.filter(t => t.floor === parseInt(floorFilter))
        : tables;

    const handleZoom = useCallback((direction: 'in' | 'out') => {
        setCanvasState(prev => ({
            ...prev,
            zoom: direction === 'in'
                ? Math.min(prev.zoom + 0.1, 3)
                : Math.max(prev.zoom - 0.1, 0.5),
        }));
    }, []);

    const handleResetZoom = useCallback(() => {
        setCanvasState(prev => ({
            ...prev,
            zoom: 1,
            panX: 0,
            panY: 0,
        }));
    }, []);

    const handleToggleGrid = useCallback(() => {
        setCanvasState(prev => ({
            ...prev,
            showGrid: !prev.showGrid,
        }));
    }, []);

    const handlePan = useCallback((deltaX: number, deltaY: number) => {
        setCanvasState(prev => ({
            ...prev,
            panX: prev.panX + deltaX,
            panY: prev.panY + deltaY,
        }));
    }, []);

    const handleTableSelect = useCallback((tableId: number | null) => {
        setSelectedTableId(tableId);
    }, []);

    const handleTableMove = useCallback((tableId: number, x: number, y: number) => {
        // Get previous position for undo
        const previousPosition = tablePositions.get(tableId) || { x: 0, y: 0 };
        
        // Add to history
        historyRef.current.addAction({
            type: 'move',
            data: {
                tableId,
                previousPosition,
                newPosition: { x, y },
            },
        });

        // Update local state
        setTablePositions(prev => {
            const newMap = new Map(prev);
            newMap.set(tableId, { x, y });
            return newMap;
        });

        setUnsavedChanges(true);
    }, [tablePositions]);

    const handleTableResize = useCallback((tableId: number, width: number, height: number) => {
        // For now, just update local state - will be saved when user clicks Save
        // TODO: Add to action history for undo/redo
        setUnsavedChanges(true);
        toast.info(t('tables.resizeApplied', 'Resize applied - click Save to persist'));
    }, [t]);

    const handleTableRotate = useCallback((tableId: number, rotation: number) => {
        // For now, just update local state - will be saved when user clicks Save
        // TODO: Add to action history for undo/redo
        setUnsavedChanges(true);
        toast.info(t('tables.rotationApplied', 'Rotation applied - click Save to persist'));
    }, [t]);

    const handleUpdateDimensions = useCallback((tableId: number, width: number, height: number, rotation: number, shape: string) => {
        // Update dimensions from properties panel - will be saved when user clicks Save
        // TODO: Add to action history for undo/redo
        setUnsavedChanges(true);
        toast.success(t('tables.dimensionsUpdated', 'Dimensions updated - click Save to persist'));
    }, [t]);

    const handleSaveLayout = useCallback(async (name: string, description: string) => {
        try {
            const layoutData = {
                tables: Array.from(tablePositions.entries()).map(([tableId, pos]) => ({
                    tableId,
                    x: pos.x,
                    y: pos.y,
                    width: 80,
                    height: 80,
                    rotation: 0,
                })),
                gridSize: canvasState.gridSize,
                zoom: canvasState.zoom,
            };

            const floor = parseInt(floorFilter) || 1;
            await floorPlanApi.createLayout(floor, name, description, layoutData);
            
            toast.success(t('tables.layoutSaved', 'Layout saved successfully'));
            setShowSaveLayoutDialog(false);
        } catch (error) {
            console.error('Failed to save layout:', error);
            toast.error(t('tables.layoutSaveError', 'Failed to save layout'));
        }
    }, [tablePositions, canvasState, floorFilter, t]);

    const handleLoadLayout = useCallback(async (layoutId: number) => {
        try {
            const layout = await floorPlanApi.getLayoutById(layoutId);
            const data = layout.data as { 
                tables?: Array<{ tableId: number; x: number; y: number }>;
                gridSize?: number;
                zoom?: number;
            };

            if (data.tables) {
                const newPositions = new Map<number, { x: number; y: number }>();
                data.tables.forEach(pos => {
                    newPositions.set(pos.tableId, { x: pos.x, y: pos.y });
                });
                setTablePositions(newPositions);
                
                // Restore canvas state if available
                if (data.gridSize || data.zoom) {
                    setCanvasState(prev => ({
                        ...prev,
                        gridSize: data.gridSize || prev.gridSize,
                        zoom: data.zoom || prev.zoom,
                    }));
                }
                
                setUnsavedChanges(true);
                toast.success(t('tables.layoutLoaded', 'Layout loaded - click Save to persist'));
            }
        } catch (error) {
            console.error('Failed to load layout:', error);
            toast.error(t('tables.layoutLoadError', 'Failed to load layout'));
        }
    }, [t]);

    const handleDeleteLayout = useCallback(async (layoutId: number) => {
        try {
            await floorPlanApi.deleteLayout(layoutId);
            setSavedLayouts(prev => prev.filter(l => l.layoutId !== layoutId));
            toast.success(t('tables.layoutDeleted', 'Layout deleted'));
        } catch (error) {
            console.error('Failed to delete layout:', error);
            toast.error(t('tables.layoutDeleteError', 'Failed to delete layout'));
        }
    }, [t]);

    const loadSavedLayouts = useCallback(async () => {
        try {
            setLayoutsLoading(true);
            const floor = parseInt(floorFilter) || 1;
            const layouts = await floorPlanApi.getLayouts(floor);
            setSavedLayouts(layouts);
        } catch (error) {
            console.error('Failed to load layouts:', error);
        } finally {
            setLayoutsLoading(false);
        }
    }, [floorFilter]);

    useEffect(() => {
        if (showLoadLayoutDialog) {
            loadSavedLayouts();
        }
    }, [showLoadLayoutDialog, loadSavedLayouts]);

    const handleToolChange = useCallback((tool: EditorTool) => {
        setActiveTool(tool);
        
        // Clear selection when switching tools
        if (tool !== 'select') {
            setSelectedTableId(null);
        }
    }, []);

    const handleSave = useCallback(async () => {
        if (!unsavedChanges) {
            toast.info(t('tables.noChanges', 'No changes to save'));
            return;
        }

        try {
            setIsSaving(true);
            
            // Prepare data for bulk position update
            const positionsToSave = Array.from(tablePositions.entries()).map(([tableId, pos]) => ({
                tableId,
                x: pos.x,
                y: pos.y,
                width: 80, // Default width
                height: 80, // Default height
                rotation: 0,
                shape: 'rectangle',
            }));

            if (positionsToSave.length > 0) {
                // Save to database via API
                await floorPlanApi.updateTablePositions(positionsToSave);
            }

            toast.success(t('tables.visualFloorPlanSaved', 'Floor plan saved successfully'));
            setUnsavedChanges(false);
            
            // Clear history after successful save
            historyRef.current.clear();
        } catch (error) {
            console.error('Failed to save floor plan:', error);
            toast.error(t('tables.saveError', 'Failed to save floor plan'));
        } finally {
            setIsSaving(false);
        }
    }, [t, unsavedChanges, tablePositions]);

    const handleUndo = useCallback(() => {
        if (!historyRef.current.canUndo()) return;

        const currentAction = historyRef.current.getCurrentAction();
        historyRef.current.undo();

        if (currentAction && currentAction.type === 'move') {
            const { tableId, previousPosition } = currentAction.data;
            setTablePositions(prev => {
                const newMap = new Map(prev);
                newMap.set(tableId, previousPosition);
                return newMap;
            });
            setUnsavedChanges(true);
            toast.success(t('common.undone', 'Action undone'));
        }
    }, [t]);

    const handleRedo = useCallback(() => {
        if (!historyRef.current.canRedo()) return;

        const action = historyRef.current.redo();
        
        if (action && action.type === 'move') {
            const { tableId, newPosition } = action.data;
            setTablePositions(prev => {
                const newMap = new Map(prev);
                newMap.set(tableId, newPosition);
                return newMap;
            });
            setUnsavedChanges(true);
            toast.success(t('common.redone', 'Action redone'));
        }
    }, [t]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            }
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
                e.preventDefault();
                handleRedo();
            }
            if (e.key === 'Delete' && selectedTableId) {
                e.preventDefault();
                handleToolChange('delete');
            }
            if (e.key === 'g') {
                e.preventDefault();
                handleToggleGrid();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedTableId, handleSave, handleUndo, handleRedo, handleToolChange, handleToggleGrid]);

    // Merge local position changes into tables for canvas
    const tablesWithPositions = useMemo(() => {
        return filteredTables.map(table => {
            const position = tablePositions.get(table.tableId);
            if (position) {
                return {
                    ...table,
                    positionX: position.x,
                    positionY: position.y,
                };
            }
            return table;
        });
    }, [filteredTables, tablePositions]);

    return (
        <div className="flex flex-col h-screen gap-4 bg-background">
            <EditorToolbar
                activeTool={activeTool}
                onToolChange={handleToolChange}
                onZoom={handleZoom}
                onResetZoom={handleResetZoom}
                onToggleGrid={handleToggleGrid}
                showGrid={canvasState.showGrid}
                zoom={canvasState.zoom}
                onSave={handleSave}
                onUndo={handleUndo}
                onRedo={handleRedo}
                hasUnsavedChanges={unsavedChanges}
                canUndo={historyRef.current.canUndo()}
                canRedo={historyRef.current.canRedo()}
                isSaving={isSaving}
                onSaveLayout={() => setShowSaveLayoutDialog(true)}
                onLoadLayout={() => setShowLoadLayoutDialog(true)}
            />

            <div className="flex flex-1 gap-4 overflow-hidden px-4 pb-4">
                {/* Main Canvas */}
                <div className="flex-1 relative bg-mute rounded-lg border overflow-hidden" ref={canvasRef}>
                    <VisualFloorPlanCanvas
                        tables={tablesWithPositions}
                        selectedTableId={selectedTableId}
                        activeTool={activeTool}
                        zoom={canvasState.zoom}
                        panX={canvasState.panX}
                        panY={canvasState.panY}
                        gridSize={canvasState.gridSize}
                        showGrid={canvasState.showGrid}
                        loading={loading}
                        onTableSelect={handleTableSelect}
                        onTableMove={handleTableMove}
                        onTableResize={handleTableResize}
                        onTableRotate={handleTableRotate}
                        onPan={handlePan}
                        onEdit={onEdit}
                        onChangeStatus={onChangeStatus}
                        onViewQR={onViewQR}
                    />
                </div>

                {/* Properties Panel */}
                {selectedTableId && (
                    <PropertiesPanel
                        table={tablesWithPositions.find(t => t.tableId === selectedTableId)}
                        onEdit={onEdit}
                        onChangeStatus={onChangeStatus}
                        onUpdateDimensions={handleUpdateDimensions}
                    />
                )}
            </div>

            {/* Save Layout Dialog */}
            <SaveLayoutDialog
                open={showSaveLayoutDialog}
                onClose={() => setShowSaveLayoutDialog(false)}
                onSave={handleSaveLayout}
            />

            {/* Load Layout Dialog */}
            <LoadLayoutDialog
                open={showLoadLayoutDialog}
                onClose={() => setShowLoadLayoutDialog(false)}
                onLoad={handleLoadLayout}
                onDelete={handleDeleteLayout}
                layouts={savedLayouts}
                loading={layoutsLoading}
            />
        </div>
    );
}
