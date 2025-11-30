'use client';

import { ViewMode } from '../types';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewModeSwitcherProps {
    mode: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export function ViewModeSwitcher({ mode, onChange }: ViewModeSwitcherProps) {
    return (
        <div className="flex items-center border rounded-lg p-1">
            <Button
                variant="ghost"
                size="sm"
                className={cn('h-8 px-3', mode === 'grid' && 'bg-muted')}
                onClick={() => onChange('grid')}
            >
                <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={cn('h-8 px-3', mode === 'table' && 'bg-muted')}
                onClick={() => onChange('table')}
            >
                <List className="w-4 h-4" />
            </Button>
        </div>
    );
}
