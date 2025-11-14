import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TEMPLATE_METADATA, LayoutTemplateId } from '@/lib/visual-floor-plan/templates';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface TemplatesDialogProps {
    open: boolean;
    onClose: () => void;
    onApply: (template: LayoutTemplateId) => Promise<void> | void;
}

export function TemplatesDialog({ open, onClose, onApply }: TemplatesDialogProps) {
    const { t } = useTranslation();
    const [busyTemplate, setBusyTemplate] = useState<LayoutTemplateId | null>(null);

    const handleApply = async (templateId: LayoutTemplateId) => {
        try {
            setBusyTemplate(templateId);
            await onApply(templateId);
            onClose();
        } finally {
            setBusyTemplate(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('tables.useTemplate', 'Use Layout Template')}</DialogTitle>
                    <DialogDescription>
                        {t('tables.templateDescription', 'Jump-start your floor plan by applying one of the curated presets below. You can continue customizing after the template loads.')}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 md:grid-cols-2">
                    {TEMPLATE_METADATA.map((template) => (
                        <Card key={template.id} className="flex flex-col border-muted bg-muted/30">
                            <CardHeader>
                                <CardTitle>{template.name}</CardTitle>
                                <CardDescription>{template.recommendedFor}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                                <p>{template.description}</p>
                                <Button
                                    variant="secondary"
                                    onClick={() => handleApply(template.id)}
                                    disabled={busyTemplate !== null}
                                    className="mt-auto w-full"
                                >
                                    {busyTemplate === template.id && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {busyTemplate === template.id
                                        ? t('tables.applyingTemplate', 'Applying template...')
                                        : t('tables.applyTemplate', 'Apply Template')}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={onClose}>
                        {t('common.close', 'Close')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
