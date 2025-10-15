'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useTableStore } from '@/stores/tableStore';
import { hasPermission } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { TableStats } from '@/components/tables/TableStats';
import { TableFilters } from '@/components/tables/TableFilters';
import { TableCard } from '@/components/tables/TableCard';

export default function TablesPage() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const { tables } = useTableStore();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const canManageTables = user ? hasPermission(user.role, 'tables.update') : false;

    // Group tables by floor/section
    const tablesByFloor = tables.reduce((acc, table) => {
        const floor = table.floor || 0;
        if (!acc[floor]) acc[floor] = [];
        acc[floor].push(table);
        return acc;
    }, {} as Record<number, typeof tables>);

    const handleTableClick = (tableId: number) => {
        console.log('Table clicked:', tableId);
        // TODO: Show table details modal
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title={t('tables.title') || 'Table Management'}
                subtitle={t('tables.subtitle') || 'Manage restaurant tables and seating'}
                actions={<TableFilters viewMode={viewMode} onViewModeChange={setViewMode} />}
            />

            {/* Stats */}
            <TableStats
                total={tables.length}
                available={tables.filter((t) => t.status === 'available').length}
                occupied={tables.filter((t) => t.status === 'occupied').length}
                reserved={tables.filter((t) => t.status === 'reserved').length}
            />

            {/* Tables by Floor */}
            {Object.keys(tablesByFloor)
                .sort()
                .map((floor) => (
                    <div key={floor}>
                        <h2 className="text-xl font-semibold mb-4">
                            {floor === '0' ? 'Ground Floor' : `Floor ${floor}`}
                        </h2>

                        {viewMode === 'grid' ? (
                            <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
                                {tablesByFloor[Number(floor)].map((table) => (
                                    <TableCard
                                        key={table.tableId}
                                        table={table}
                                        viewMode="grid"
                                        onClick={handleTableClick}
                                        canManage={canManageTables}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {tablesByFloor[Number(floor)].map((table) => (
                                    <TableCard
                                        key={table.tableId}
                                        table={table}
                                        viewMode="list"
                                        onClick={handleTableClick}
                                        canManage={canManageTables}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
        </div>
    );
}
