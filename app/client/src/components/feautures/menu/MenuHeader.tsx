import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface MenuHeaderProps {
    onAddClick: () => void;
}

export function MenuHeader({ onAddClick }: MenuHeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {t('menu.title')}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {t('menu.pageDescription')}
                </p>
            </div>
            <Button onClick={onAddClick} size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                <Plus className="mr-2 h-5 w-5" />
                {t('menu.addItem')}
            </Button>
        </div>
    );
}
