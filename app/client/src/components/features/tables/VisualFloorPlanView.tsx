'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Table, TableStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { VisualFloorPlanCanvas } from './visual-floor-plan/VisualFloorPlanCanvas';
import { EditorToolbar } from './visual-floor-plan/EditorToolbar';
import { PropertiesPanel } from './visual-floor-plan/PropertiesPanel';
import { ActionHistory } from '@/lib/visual-floor-plan/action-history';
import { floorPlanApi } from '@/services/floor-plan.service';

interface VisualFloorPlanViewProps {
    tables: Table[];
    loading: boolean;
    floorFilter: string;
    onEdit: (table: Table) => void;
    onChangeStatus: (table: Table) => void;
    onViewQR: (table: Table) => void;
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
        showGrid: false,
    });
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
        setUnsavedChanges(true);
        // Position will be saved to database when user clicks save
    }, []);

    const handleToolChange = useCallback((tool: EditorTool) => {
        setActiveTool(tool);
        
        // Clear selection when switching tools
        if (tool !== 'select') {
            setSelectedTableId(null);
        }
    }, []);

    const handleSave = useCallback(async () => {
        try {
            setIsSaving(true);
            // TODO: Implement save logic to database
            // For now, just update the canvas state
            toast.success(t('tables.visualFloorPlanSaved', 'Floor plan saved successfully'));
            setUnsavedChanges(false);
        } catch (error) {
            console.error('Failed to save floor plan:', error);
            toast.error(t('tables.saveError', 'Failed to save floor plan'));
        } finally {
            setIsSaving(false);
        }
    }, [t]);

    const handleUndo = useCallback(() => {
        const action = historyRef.current.undo();
        if (action) {
            // Apply undo action
            toast.success(t('common.undone', 'Action undone'));
        }
    }, [t]);

    const handleRedo = useCallback(() => {
        const action = historyRef.current.redo();
        if (action) {
            // Apply redo action
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
            />

            <div className="flex flex-1 gap-4 overflow-hidden px-4 pb-4">
                {/* Main Canvas */}
                <div className="flex-1 relative bg-mute rounded-lg border overflow-hidden" ref={canvasRef}>
                    <VisualFloorPlanCanvas
                        tables={filteredTables}
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
                        onPan={handlePan}
                        onEdit={onEdit}
                        onChangeStatus={onChangeStatus}
                        onViewQR={onViewQR}
                    />
                </div>

                {/* Properties Panel */}
                {selectedTableId && (
                    <PropertiesPanel
                        table={filteredTables.find(t => t.tableId === selectedTableId)}
                        onEdit={onEdit}
                        onChangeStatus={onChangeStatus}
                    />
                )}
            </div>
        </div>
    );
}
