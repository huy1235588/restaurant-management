'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface SaveLayoutDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (name: string, description: string) => Promise<void>;
}

export function SaveLayoutDialog({ open, onClose, onSave }: SaveLayoutDialogProps) {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return;

        try {
            setIsSaving(true);
            await onSave(name, description);
            setName('');
            setDescription('');
            onClose();
        } catch (error) {
            console.error('Failed to save layout:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('tables.saveLayout', 'Save Layout')}</DialogTitle>
                    <DialogDescription>
                        {t('tables.saveLayoutDescription', 'Save the current table layout for future use.')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="layout-name">
                            {t('tables.layoutName', 'Layout Name')} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="layout-name"
                            placeholder={t('tables.layoutNamePlaceholder', 'e.g., Weekend Setup')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isSaving}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="layout-description">
                            {t('tables.layoutDescription', 'Description')} ({t('common.optional', 'Optional')})
                        </Label>
                        <Textarea
                            id="layout-description"
                            placeholder={t('tables.layoutDescriptionPlaceholder', 'Describe this layout...')}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            disabled={isSaving}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {t('common.save', 'Save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
