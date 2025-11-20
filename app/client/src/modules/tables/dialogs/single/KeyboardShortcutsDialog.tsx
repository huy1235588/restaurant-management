import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { Command } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
    open: boolean;
    onClose: () => void;
}

export function KeyboardShortcutsDialog({ open, onClose }: KeyboardShortcutsDialogProps) {
    const { t } = useTranslation();

    const shortcuts = [
        {
            keys: ['Shift', 'N'],
            description: t('tables.shortcuts.newTable', 'Create a new table'),
        },
        {
            keys: ['/'],
            description: t('tables.shortcuts.focusSearch', 'Focus on search input'),
        },
        {
            keys: ['Esc'],
            description: t('tables.shortcuts.closeOrClear', 'Close dialogs and clear selection'),
        },
        {
            keys: ['?'],
            description: t('tables.shortcuts.showHelp', 'Show keyboard shortcuts'),
        },
    ];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Command className="h-5 w-5" />
                        {t('tables.keyboardShortcuts', 'Keyboard Shortcuts')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('tables.shortcutsDescription', 'Use these keyboard shortcuts to navigate faster')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {shortcuts.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                            <div className="flex gap-1">
                                {shortcut.keys.map((key, i) => (
                                    <div key={i}>
                                        <kbd className="rounded border border-gray-300 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                                            {key}
                                        </kbd>
                                        {i < shortcut.keys.length - 1 && (
                                            <span className="mx-1 text-xs text-muted-foreground">+</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
