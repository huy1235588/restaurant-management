import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OrderStatus } from '@/types';

interface OrderFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedStatus: OrderStatus | 'all';
    onStatusChange: (status: OrderStatus | 'all') => void;
    searchPlaceholder?: string;
}

export function OrderFilters({
    searchTerm,
    onSearchChange,
    selectedStatus,
    onStatusChange,
    searchPlaceholder = 'Search by order ID or table...',
}: OrderFiltersProps) {
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
                            variant={selectedStatus === 'all' ? 'default' : 'outline'}
                            onClick={() => onStatusChange('all')}
                        >
                            All
                        </Button>
                        <Button
                            variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                            onClick={() => onStatusChange('pending')}
                        >
                            Pending
                        </Button>
                        <Button
                            variant={selectedStatus === 'preparing' ? 'default' : 'outline'}
                            onClick={() => onStatusChange('preparing')}
                        >
                            Preparing
                        </Button>
                        <Button
                            variant={selectedStatus === 'ready' ? 'default' : 'outline'}
                            onClick={() => onStatusChange('ready')}
                        >
                            Ready
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
