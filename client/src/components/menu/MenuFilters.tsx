import { Search, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type ViewMode = 'grid' | 'list';

interface MenuFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    categories: string[];
    searchPlaceholder?: string;
}

export function MenuFilters({
    searchTerm,
    onSearchChange,
    viewMode,
    onViewModeChange,
    selectedCategory,
    onCategoryChange,
    categories,
    searchPlaceholder = 'Search menu items...',
}: MenuFiltersProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
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
                        <Button
                            variant={selectedCategory === 'all' ? 'default' : 'outline'}
                            onClick={() => onCategoryChange('all')}
                        >
                            All
                        </Button>
                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? 'default' : 'outline'}
                                onClick={() => onCategoryChange(category)}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
