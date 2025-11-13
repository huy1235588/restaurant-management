import { Table } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableStatusBadge } from './TableStatusBadge';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface TableCardProps {
    table: Table;
    onClick?: (table: Table) => void;
    isSelected?: boolean;
}

export function TableCard({ table, onClick, isSelected }: TableCardProps) {
    const { t } = useTranslation();

    return (
        <Card
            role="button"
            tabIndex={0}
            onClick={() => onClick?.(table)}
            className={cn(
                'w-48 cursor-pointer border-dashed transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                isSelected && 'border-primary shadow-lg'
            )}
        >
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold">{table.tableNumber}</CardTitle>
                    <TableStatusBadge status={table.status} />
                </div>
                {table.tableName && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{table.tableName}</p>
                )}
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                        {t('tables.card.seatCount', {
                            count: table.capacity,
                            defaultValue:
                                table.capacity === 1 ? '{{count}} seat' : '{{count}} seats',
                        })}
                    </span>
                </div>
                {(table.floor || table.section) && (
                    <div className="text-xs text-muted-foreground">
                        {table.floor && (
                            <span>
                                {t('tables.card.floor', 'Floor {{floor}}', { floor: table.floor })}
                            </span>
                        )}
                        {table.floor && table.section && <span className="mx-1">•</span>}
                        {table.section && (
                            <span>
                                {t('tables.card.section', 'Section {{section}}', {
                                    section: table.section,
                                })}
                            </span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
