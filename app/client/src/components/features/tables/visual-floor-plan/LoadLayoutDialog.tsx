'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Layout as LayoutIcon, Trash2 } from 'lucide-react';
import { FloorPlanLayout } from '@/services/floor-plan.service';
import { format } from 'date-fns';

interface LoadLayoutDialogProps {
    open: boolean;
    onClose: () => void;
    onLoad: (layoutId: number) => Promise<void>;
    onDelete: (layoutId: number) => Promise<void>;
    layouts: FloorPlanLayout[];
    loading: boolean;
}

export function LoadLayoutDialog({ 
    open, 
    onClose, 
    onLoad, 
    onDelete, 
    layouts,
    loading 
}: LoadLayoutDialogProps) {
    const { t } = useTranslation();
    const [selectedLayoutId, setSelectedLayoutId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const handleLoad = async () => {
        if (selectedLayoutId === null) return;

        try {
            setIsLoading(true);
            await onLoad(selectedLayoutId);
            onClose();
        } catch (error) {
            console.error('Failed to load layout:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (layoutId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (!confirm(t('tables.confirmDeleteLayout', 'Are you sure you want to delete this layout?'))) {
            return;
        }

        try {
            setIsDeleting(layoutId);
            await onDelete(layoutId);
        } catch (error) {
            console.error('Failed to delete layout:', error);
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('tables.loadLayout', 'Load Layout')}</DialogTitle>
                    <DialogDescription>
                        {t('tables.loadLayoutDescription', 'Select a saved layout to apply to your floor plan.')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : layouts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <LayoutIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>{t('tables.noSavedLayouts', 'No saved layouts found.')}</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {layouts.map((layout) => (
                                <Card
                                    key={layout.layoutId}
                                    className={`cursor-pointer transition-all hover:shadow-md ${
                                        selectedLayoutId === layout.layoutId
                                            ? 'ring-2 ring-blue-500 border-blue-500'
                                            : ''
                                    }`}
                                    onClick={() => setSelectedLayoutId(layout.layoutId)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-base">{layout.name}</CardTitle>
                                                <CardDescription className="text-xs mt-1">
                                                    {t('tables.floor', 'Floor')} {layout.floor} •{' '}
                                                    {format(new Date(layout.createdAt), 'PPp')}
                                                </CardDescription>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => handleDelete(layout.layoutId, e)}
                                                disabled={isDeleting === layout.layoutId}
                                            >
                                                {isDeleting === layout.layoutId ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                )}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    {layout.description && (
                                        <CardContent className="pt-0">
                                            <p className="text-sm text-muted-foreground">{layout.description}</p>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button
                        onClick={handleLoad}
                        disabled={selectedLayoutId === null || isLoading}
                    >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {t('tables.loadSelected', 'Load Selected')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
