'use client';

import { ViewMode } from '../types';
import { Button } from '@/components/ui/button';
import { Grid3x3, List, Table } from 'lucide-react';

interface ViewModeSwitcherProps {
    value: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export function ViewModeSwitcher({ value, onChange }: ViewModeSwitcherProps) {
    const modes: { value: ViewMode; icon: React.ReactNode; label: string }[] = [
        { value: 'table', icon: <Table className="w-4 h-4" />, label: 'Table' },
        { value: 'list', icon: <List className="w-4 h-4" />, label: 'List' },
        { value: 'grid', icon: <Grid3x3 className="w-4 h-4" />, label: 'Grid' },
    ];

    return (
        <div className="flex items-center gap-1 border rounded-lg p-1">
            {modes.map((mode) => (
                <Button
                    key={mode.value}
                    variant={value === mode.value ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => onChange(mode.value)}
                    className="gap-1.5"
                >
                    {mode.icon}
                    <span className="hidden sm:inline">{mode.label}</span>
                </Button>
            ))}
        </div>
    );
}
