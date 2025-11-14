'use client';

import React, { useState } from 'react';
import {
    MousePointer2,
    Hand,
    Plus,
    Trash2,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Grid3x3,
    Save,
    Undo2,
    Redo2,
    RotateCcw,
    FolderOpen,
    Download,
} from 'lucide-react';
import { useEditorStore } from '../stores';
import { useHistoryStore } from '../stores';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { FloorSelector } from './FloorSelector';
import { SaveLayoutDialog } from './SaveLayoutDialog';
import { LoadLayoutDialog } from './LoadLayoutDialog';

interface EditorToolbarProps {
    onSave: () => void;
    onUndo: () => void;
    onRedo: () => void;
    hasUnsavedChanges?: boolean;
}

export function EditorToolbar({
    onSave,
    onUndo,
    onRedo,
    hasUnsavedChanges = false,
}: EditorToolbarProps) {
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showLoadDialog, setShowLoadDialog] = useState(false);
    
    const {
        currentTool,
        setTool,
        zoom,
        setZoom,
        grid,
        setGrid,
        toggleFullscreen,
        resetView,
    } = useEditorStore();
    
    const { canUndo, canRedo } = useHistoryStore();
    
    const tools = [
        { id: 'select' as const, icon: MousePointer2, label: 'Select (V)', shortcut: 'V' },
        { id: 'pan' as const, icon: Hand, label: 'Pan (H)', shortcut: 'H' },
        { id: 'add' as const, icon: Plus, label: 'Add Table (T)', shortcut: 'T' },
        { id: 'delete' as const, icon: Trash2, label: 'Delete (Del)', shortcut: 'Del' },
    ];
    
    const handleZoomIn = () => {
        setZoom(Math.min(zoom + 0.1, 2.0));
    };
    
    const handleZoomOut = () => {
        setZoom(Math.max(zoom - 0.1, 0.25));
    };
    
    const handleToggleGrid = () => {
        setGrid({ enabled: !grid.enabled });
    };
    
    return (
        <TooltipProvider>
            <div className="flex items-center gap-2 p-2 bg-white border-b">
                {/* Floor Selector */}
                <FloorSelector />
                
                <Separator orientation="vertical" className="h-8" />
                
                {/* Tool Selection */}
                <div className="flex items-center gap-1">
                    {tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                            <Tooltip key={tool.id}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={currentTool === tool.id ? 'default' : 'ghost'}
                                        size="icon"
                                        onClick={() => setTool(tool.id)}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{tool.label}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
                
                <Separator orientation="vertical" className="h-8" />
                
                {/* History Actions */}
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onUndo}
                                disabled={!canUndo()}
                            >
                                <Undo2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Undo (Ctrl+Z)</p>
                        </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onRedo}
                                disabled={!canRedo()}
                            >
                                <Redo2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Redo (Ctrl+Shift+Z)</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                
                <Separator orientation="vertical" className="h-8" />
                
                {/* View Controls */}
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Zoom Out</p>
                        </TooltipContent>
                    </Tooltip>
                    
                    <span className="text-sm font-medium min-w-16 text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Zoom In</p>
                        </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={resetView}>
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Reset View (0)</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                
                <Separator orientation="vertical" className="h-8" />
                
                {/* Grid Toggle */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={grid.enabled ? 'default' : 'ghost'}
                            size="icon"
                            onClick={handleToggleGrid}
                        >
                            <Grid3x3 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Toggle Grid (G)</p>
                    </TooltipContent>
                </Tooltip>
                
                <Separator orientation="vertical" className="h-8" />
                
                {/* Fullscreen */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Fullscreen (F)</p>
                    </TooltipContent>
                </Tooltip>
                
                <div className="flex-1" />
                
                {/* Layout Management */}
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setShowLoadDialog(true)}
                            >
                                <FolderOpen className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Load Layout</p>
                        </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setShowSaveDialog(true)}
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Save as Layout</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                
                <Separator orientation="vertical" className="h-8" />
                
                {/* Save Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={onSave} className="gap-2">
                            <Save className="h-4 w-4" />
                            Save Positions
                            {hasUnsavedChanges && (
                                <span className="ml-1 text-yellow-500">*</span>
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Save Table Positions (Ctrl+S)</p>
                    </TooltipContent>
                </Tooltip>
            </div>
            
            {/* Dialogs */}
            <SaveLayoutDialog open={showSaveDialog} onOpenChange={setShowSaveDialog} />
            <LoadLayoutDialog open={showLoadDialog} onOpenChange={setShowLoadDialog} />
        </TooltipProvider>
    );
}
