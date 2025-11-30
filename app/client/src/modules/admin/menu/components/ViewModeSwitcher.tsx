'use client';

import { ViewMode } from '../types';
import { Button } from '@/components/ui/button';
import { Grid3x3, List, Table } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ViewModeSwitcherProps {
    value: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export function ViewModeSwitcher({ value, onChange }: ViewModeSwitcherProps) {
    const { t } = useTranslation();

    const modes: { value: ViewMode; icon: React.ReactNode; label: string }[] = [
        { value: 'table', icon: <Table className="w-4 h-4" />, label: t('menu.viewTable') },
        { value: 'list', icon: <List className="w-4 h-4" />, label: t('menu.viewList') },
        { value: 'grid', icon: <Grid3x3 className="w-4 h-4" />, label: t('menu.viewGrid') },
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
