'use client';

import { StaffStatistics, ALL_ROLES } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX, Shield, Briefcase, UtensilsCrossed, ChefHat, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StaffStatsProps {
    stats: StaffStatistics;
}

const ROLE_ICONS = {
    admin: Shield,
    manager: Briefcase,
    waiter: UtensilsCrossed,
    chef: ChefHat,
    cashier: Wallet,
};

export function StaffStats({ stats }: StaffStatsProps) {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {/* Total Staff */}
            <Card>
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-xs text-muted-foreground">{t('staff.total')}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Active */}
            <Card>
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{stats.active}</p>
                        <p className="text-xs text-muted-foreground">{t('common.active')}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Inactive */}
            <Card>
                <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900/30">
                        <UserX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{stats.inactive}</p>
                        <p className="text-xs text-muted-foreground">{t('common.inactive')}</p>
                    </div>
                </CardContent>
            </Card>

            {/* By Role */}
            {ALL_ROLES.map((role) => {
                const Icon = ROLE_ICONS[role];
                return (
                    <Card key={role}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                                <Icon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.byRole[role]}</p>
                                <p className="text-xs text-muted-foreground">{t(`roles.${role}`)}</p>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
