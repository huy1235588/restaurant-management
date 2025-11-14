'use client';

import { Button } from '@/components/ui/button';
import { 
    Pointer, 
    Hand, 
    Plus, 
    Trash2, 
    ZoomIn, 
    ZoomOut, 
    Grid3X3, 
    Save,
    RotateCcw,
    Undo2,
    Redo2,
    FolderOpen,
    Layout,
    Wand2,
    Maximize2,
    Home,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/ui/separator';

type EditorTool = 'select' | 'pan' | 'add' | 'delete' | 'zoom-in' | 'zoom-out' | 'grid';

interface EditorToolbarProps {
    activeTool: EditorTool;
    onToolChange: (tool: EditorTool) => void;
    onZoom: (direction: 'in' | 'out') => void;
    onResetZoom: () => void;
    onToggleGrid: () => void;
    showGrid: boolean;
    zoom: number;
    onSave: () => void;
    onUndo: () => void;
    onRedo: () => void;
    hasUnsavedChanges: boolean;
    canUndo: boolean;
    canRedo: boolean;
    isSaving?: boolean;
    onSaveLayout?: () => void;
    onLoadLayout?: () => void;
    onUseTemplate?: () => void;
    onFitToView?: () => void;
    onResetView?: () => void;
}

export function EditorToolbar({
    activeTool,
    onToolChange,
    onZoom,
    onResetZoom,
    onToggleGrid,
    showGrid,
    zoom,
    onSave,
    onUndo,
    onRedo,
    hasUnsavedChanges,
    canUndo,
    canRedo,
    isSaving = false,
    onSaveLayout,
    onLoadLayout,
    onUseTemplate,
    onFitToView,
    onResetView,
}: EditorToolbarProps) {
    const { t } = useTranslation();

    return (
        <div className="bg-background border-b shadow-sm px-4 py-3" role="toolbar" aria-label="Visual floor plan editor toolbar">
            <div className="flex items-center justify-between gap-4">
                {/* Left: Tool Palette */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1" role="group" aria-label="Editor tools">
                    <Button
                        variant={activeTool === 'select' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onToolChange('select')}
                        title={t('tables.visualEditor.selectTool', 'Select Tool (V)')}
                        aria-label={t('tables.visualEditor.selectTool', 'Select Tool (V)')}
                        aria-pressed={activeTool === 'select'}
                        className="gap-2"
                    >
                        <Pointer className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={activeTool === 'pan' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onToolChange('pan')}
                        title={t('tables.visualEditor.panTool', 'Pan Tool (H)')}
                        aria-label={t('tables.visualEditor.panTool', 'Pan Tool (H)')}
                        aria-pressed={activeTool === 'pan'}
                        className="gap-2"
                    >
                        <Hand className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={activeTool === 'add' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onToolChange('add')}
                        title={t('tables.visualEditor.addTableTool', 'Add Table (T)')}
                        aria-label={t('tables.visualEditor.addTableTool', 'Add Table (T)')}
                        aria-pressed={activeTool === 'add'}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={activeTool === 'delete' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onToolChange('delete')}
                        title={t('tables.visualEditor.deleteTool', 'Delete Tool (Del)')}
                        aria-label={t('tables.visualEditor.deleteTool', 'Delete Tool (Del)')}
                        aria-pressed={activeTool === 'delete'}
                        className="gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    <Button
                        variant={showGrid ? 'default' : 'ghost'}
                        size="sm"
                        onClick={onToggleGrid}
                        title={t('tables.visualEditor.gridToggle', 'Toggle Grid (G)')}
                        aria-label={t('tables.visualEditor.gridToggle', 'Toggle Grid (G)')}
                        aria-pressed={showGrid}
                        className="gap-2"
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </Button>
                </div>

                {/* Center: Zoom Controls */}
                <div className="flex items-center gap-2" role="group" aria-label="Zoom controls">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onZoom('out')}
                        title={t('common.zoomOut', 'Zoom Out')}
                        aria-label={t('common.zoomOut', 'Zoom Out')}
                    >
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <div 
                        className="px-3 py-1 bg-muted rounded text-sm font-medium text-center w-16"
                        role="status"
                        aria-live="polite"
                        aria-label={`Current zoom level: ${(zoom * 100).toFixed(0)}%`}
                    >
                        {(zoom * 100).toFixed(0)}%
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onZoom('in')}
                        title={t('common.zoomIn', 'Zoom In')}
                        aria-label={t('common.zoomIn', 'Zoom In')}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onResetZoom}
                        title={t('common.reset', 'Reset Zoom')}
                        aria-label={t('common.reset', 'Reset Zoom')}
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    {onFitToView && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onFitToView}
                            title={t('tables.fitToView', 'Fit to View - Center all tables')}
                            aria-label={t('tables.fitToView', 'Fit to View - Center all tables')}
                        >
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                    )}
                    {onResetView && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onResetView}
                            title={t('tables.resetView', 'Reset View - Return to origin')}
                            aria-label={t('tables.resetView', 'Reset View - Return to origin')}
                        >
                            <Home className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-2" role="group" aria-label="Action buttons">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onUndo}
                        disabled={!canUndo}
                        title={t('common.undo', 'Undo (Ctrl+Z)')}
                        aria-label={t('common.undo', 'Undo (Ctrl+Z)')}
                    >
                        <Undo2 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRedo}
                        disabled={!canRedo}
                        title={t('common.redo', 'Redo (Ctrl+Shift+Z)')}
                        aria-label={t('common.redo', 'Redo (Ctrl+Shift+Z)')}
                    >
                        <Redo2 className="w-4 h-4" />
                    </Button>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    {onSaveLayout && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSaveLayout}
                            title={t('tables.saveLayout', 'Save Layout')}
                            className="gap-2"
                        >
                            <Layout className="w-4 h-4" />
                            {t('tables.saveLayout', 'Save Layout')}
                        </Button>
                    )}

                    {onLoadLayout && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onLoadLayout}
                            title={t('tables.loadLayout', 'Load Layout')}
                            className="gap-2"
                        >
                            <FolderOpen className="w-4 h-4" />
                            {t('tables.loadLayout', 'Load Layout')}
                        </Button>
                    )}

                    {onUseTemplate && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onUseTemplate}
                            title={t('tables.useTemplate', 'Use Template')}
                            className="gap-2"
                        >
                            <Wand2 className="w-4 h-4" />
                            {t('tables.useTemplate', 'Use Template')}
                        </Button>
                    )}

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    <Button
                        variant={hasUnsavedChanges ? 'default' : 'outline'}
                        size="sm"
                        onClick={onSave}
                        disabled={isSaving}
                        title={t('tables.visualEditor.save', 'Save (Ctrl+S)')}
                        className="gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                        {hasUnsavedChanges && !isSaving && <span className="text-xs ml-1">*</span>}
                    </Button>
                </div>
            </div>
        </div>
    );
}
