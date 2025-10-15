import { Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewMode = 'grid' | 'list';

interface TableFiltersProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export function TableFilters({ viewMode, onViewModeChange }: TableFiltersProps) {
    return (
        <div className="flex items-center gap-2">
            <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => onViewModeChange('grid')}
            >
                <Grid className="h-4 w-4" />
            </Button>
            <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => onViewModeChange('list')}
            >
                <List className="h-4 w-4" />
            </Button>
        </div>
    );
}
