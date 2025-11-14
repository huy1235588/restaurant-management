'use client';

import { Pointer, Hand, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

type EditorTool = 'select' | 'pan' | 'add' | 'delete' | 'zoom-in' | 'zoom-out' | 'grid';

interface ToolIndicatorProps {
  activeTool: EditorTool;
}

/**
 * Visual indicator showing the currently active tool
 */
export function ToolIndicator({ activeTool }: ToolIndicatorProps) {
  const { t } = useTranslation();

  if (activeTool === 'select') return null; // Don't show indicator for default select tool

  const getToolInfo = () => {
    switch (activeTool) {
      case 'pan':
        return {
          icon: Hand,
          label: t('tables.panToolActive', 'Pan Tool Active'),
          color: 'bg-blue-500',
          hint: t('tables.panToolHint', 'Click and drag to pan the canvas'),
        };
      case 'add':
        return {
          icon: Plus,
          label: t('tables.addToolActive', 'Add Table Tool Active'),
          color: 'bg-green-500',
          hint: t('tables.addToolHint', 'Click on the canvas to place a new table'),
        };
      case 'delete':
        return {
          icon: Trash2,
          label: t('tables.deleteToolActive', 'Delete Tool Active'),
          color: 'bg-red-500',
          hint: t('tables.deleteToolHint', 'Select a table to delete'),
        };
      default:
        return null;
    }
  };

  const toolInfo = getToolInfo();
  if (!toolInfo) return null;

  const Icon = toolInfo.icon;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-lg shadow-lg border',
        'bg-background/95 backdrop-blur-sm'
      )}>
        <div className={cn('p-1.5 rounded-md', toolInfo.color)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="text-sm font-semibold">{toolInfo.label}</div>
          <div className="text-xs text-muted-foreground">{toolInfo.hint}</div>
        </div>
        <div className="text-xs text-muted-foreground border-l pl-3 ml-1">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Esc</kbd> to cancel
        </div>
      </div>
    </div>
  );
}
