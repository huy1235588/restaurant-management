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
import { TemplatesDialog } from './visual-floor-plan/TemplatesDialog';
import { ActionHistory } from '@/lib/visual-floor-plan/action-history';
import { floorPlanApi, FloorPlanLayout } from '@/services/floor-plan.service';
import { LayoutTemplateId, TemplateLayoutState, generateTemplateLayout } from '@/lib/visual-floor-plan/templates';

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
    const [tablePositions, setTablePositions] = useState<Map<number, TemplateLayoutState>>(new Map());
    const [showSaveLayoutDialog, setShowSaveLayoutDialog] = useState(false);
    const [showLoadLayoutDialog, setShowLoadLayoutDialog] = useState(false);
    const [savedLayouts, setSavedLayouts] = useState<FloorPlanLayout[]>([]);
    const [layoutsLoading, setLayoutsLoading] = useState(false);
    const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);

    // Filter tables by floor
    const filteredTables = floorFilter !== 'all'
        ? tables.filter(t => t.floor === parseInt(floorFilter))
        : tables;

    const tableLookup = useMemo(() => {
        const map = new Map<number, Table>();
        filteredTables.forEach(table => map.set(table.tableId, table));
        return map;
    }, [filteredTables]);

    const getTableDefaults = useCallback((tableId: number): TemplateLayoutState => {
        const table = tableLookup.get(tableId);
        return {
            x: table?.positionX ?? 0,
            y: table?.positionY ?? 0,
            width: table?.width ?? 80,
            height: table?.height ?? 80,
            rotation: table?.rotation ?? 0,
            shape: table?.shape ?? 'rectangle',
        };
    }, [tableLookup]);

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
        setTablePositions(prev => {
            const newMap = new Map(prev);
            const current = prev.get(tableId) || getTableDefaults(tableId);
            const previousPosition = { ...current };
            const newPosition = { ...current, x, y };

            historyRef.current.addAction({
                type: 'move',
                data: {
                    tableId,
                    previousPosition,
                    newPosition,
                },
            });

            newMap.set(tableId, newPosition);
            return newMap;
        });

        setUnsavedChanges(true);
    }, [getTableDefaults]);

    const handleTableResize = useCallback((tableId: number, width: number, height: number) => {
        setTablePositions(prev => {
            const newMap = new Map(prev);
            const current = prev.get(tableId) || getTableDefaults(tableId);
            newMap.set(tableId, { ...current, width, height });
            return newMap;
        });
        setUnsavedChanges(true);
    }, [getTableDefaults]);

    const handleTableRotate = useCallback((tableId: number, rotation: number) => {
        setTablePositions(prev => {
            const newMap = new Map(prev);
            const current = prev.get(tableId) || getTableDefaults(tableId);
            newMap.set(tableId, { ...current, rotation });
            return newMap;
        });
        setUnsavedChanges(true);
    }, [getTableDefaults]);

    const handleUpdateDimensions = useCallback((tableId: number, width: number, height: number, rotation: number, shape: string) => {
        setTablePositions(prev => {
            const newMap = new Map(prev);
            const current = prev.get(tableId) || getTableDefaults(tableId);
            newMap.set(tableId, {
                ...current,
                width,
                height,
                rotation,
                shape: shape as TemplateLayoutState['shape'],
            });
            return newMap;
        });
        setUnsavedChanges(true);
        toast.success(t('tables.dimensionsUpdated', 'Dimensions updated - click Save to persist'));
    }, [getTableDefaults, t]);

    const handleSaveLayout = useCallback(async (name: string, description: string) => {
        try {
            const tablesPayload = filteredTables.map(table => {
                const state = tablePositions.get(table.tableId) || getTableDefaults(table.tableId);
                return {
                    tableId: table.tableId,
                    x: state.x,
                    y: state.y,
                    width: state.width,
                    height: state.height,
                    rotation: state.rotation,
                    shape: state.shape,
                };
            });

            const layoutData = {
                tables: tablesPayload,
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
    }, [filteredTables, tablePositions, canvasState, floorFilter, t, getTableDefaults]);

    const handleApplyTemplate = useCallback(async (templateId: LayoutTemplateId) => {
        try {
            if (filteredTables.length === 0) {
                toast.info(t('tables.noTablesForTemplate', 'Add tables before applying a template.'));
                return;
            }

            const layout = generateTemplateLayout(templateId, filteredTables);
            setTablePositions(new Map(layout));
            setUnsavedChanges(true);
            historyRef.current.clear();
            toast.success(t('tables.templateApplied', 'Template applied - click Save to persist'));
        } catch (error) {
            console.error('Failed to apply template:', error);
            toast.error(t('tables.templateApplyError', 'Failed to apply template'));
        }
    }, [filteredTables, t]);

    const handleLoadLayout = useCallback(async (layoutId: number) => {
        try {
            const layout = await floorPlanApi.getLayoutById(layoutId);
            const data = layout.data as { 
                tables?: Array<{ tableId: number; x: number; y: number; width?: number; height?: number; rotation?: number; shape?: TemplateLayoutState['shape'] }>;
                gridSize?: number;
                zoom?: number;
            };

            if (data.tables) {
                const newPositions = new Map<number, TemplateLayoutState>();
                data.tables.forEach(pos => {
                    const defaults = getTableDefaults(pos.tableId);
                    newPositions.set(pos.tableId, {
                        x: pos.x,
                        y: pos.y,
                        width: pos.width ?? defaults.width,
                        height: pos.height ?? defaults.height,
                        rotation: pos.rotation ?? defaults.rotation,
                        shape: pos.shape ?? defaults.shape,
                    });
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
    }, [getTableDefaults, t]);

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
            
            const positionsToSave = filteredTables.map(table => {
                const override = tablePositions.get(table.tableId) || getTableDefaults(table.tableId);
                return {
                    tableId: table.tableId,
                    x: override.x,
                    y: override.y,
                    width: override.width,
                    height: override.height,
                    rotation: override.rotation,
                    shape: override.shape,
                };
            });

            await floorPlanApi.updateTablePositions(positionsToSave);

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
    }, [filteredTables, getTableDefaults, t, unsavedChanges, tablePositions]);

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
            // Tool selection shortcuts
            if (e.key === 'v' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                handleToolChange('select');
            }
            if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                handleToolChange('pan');
            }
            if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                handleToolChange('add');
            }
            // Action shortcuts
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
            if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
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
                    width: position.width,
                    height: position.height,
                    rotation: position.rotation,
                    shape: position.shape,
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
                onUseTemplate={() => setShowTemplatesDialog(true)}
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

            <TemplatesDialog
                open={showTemplatesDialog}
                onClose={() => setShowTemplatesDialog(false)}
                onApply={handleApplyTemplate}
            />
        </div>
    );
}
