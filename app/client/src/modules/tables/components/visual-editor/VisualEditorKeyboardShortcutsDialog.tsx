'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface KeyboardShortcutsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function VisualEditorKeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
    const shortcuts = [
        { category: 'Tools', key: 'V', description: 'Select Tool' },
        { category: 'Tools', key: 'H', description: 'Pan Tool' },
        { category: 'Tools', key: 'T', description: 'Add Table Tool' },
        { category: 'Tools', key: 'Delete/Backspace', description: 'Delete Selected Tables' },
        { category: 'View', key: 'G', description: 'Toggle Grid' },
        { category: 'View', key: '0', description: 'Reset Zoom (100%)' },
        { category: 'View', key: 'Ctrl + Scroll', description: 'Zoom In/Out' },
        { category: 'View', key: 'F', description: 'Toggle Fullscreen' },
        { category: 'Edit', key: 'Ctrl + Z', description: 'Undo' },
        { category: 'Edit', key: 'Ctrl + Shift + Z', description: 'Redo' },
        { category: 'Edit', key: 'Ctrl + Y', description: 'Redo (Alternative)' },
        { category: 'Edit', key: 'Ctrl + S', description: 'Save Layout' },
        { category: 'Selection', key: 'Shift + Click', description: 'Multi-Select Tables' },
        { category: 'Selection', key: 'Esc', description: 'Clear Selection / Cancel' },
        { category: 'Drag', key: 'Shift + Drag', description: 'Disable Grid Snapping' },
        { category: 'Floors', key: '1-9', description: 'Quick Switch Floor' },
    ];
    
    const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) {
            acc[shortcut.category] = [];
        }
        acc[shortcut.category].push(shortcut);
        return acc;
    }, {} as Record<string, typeof shortcuts>);
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Keyboard Shortcuts</DialogTitle>
                    <DialogDescription>
                        Use these keyboard shortcuts to work more efficiently with the visual floor plan editor.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 mt-4">
                    {Object.entries(groupedShortcuts).map(([category, items]) => (
                        <div key={category}>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                {category}
                            </h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-1/3">Key</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((shortcut, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                                                    {shortcut.key}
                                                </kbd>
                                            </TableCell>
                                            <TableCell className="text-sm">{shortcut.description}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
