import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface TablesHeaderProps {
    onCreate: () => void;
}

export function TablesHeader({ onCreate }: TablesHeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {t('tables.title', 'Table Management')}
                </h1>
                <p className="mt-1 text-muted-foreground">
                    {t('tables.description', 'Visualize and manage every table across your restaurant floor plan.')}
                </p>
            </div>
            <Button
                onClick={onCreate}
                size="lg"
                className="shadow-sm hover:shadow-md"
            >
                <Plus className="mr-2 h-5 w-5" />
                {t('tables.actions.create', 'Create Table')}
            </Button>
        </div>
    );
}
