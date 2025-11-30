import { useMemo } from 'react';
import { Staff, StaffStatistics, Role } from '../types';

// Hook for computing staff statistics
export function useStaffStats(staffList: Staff[]): StaffStatistics {
    return useMemo(() => {
        const stats: StaffStatistics = {
            total: staffList.length,
            active: 0,
            inactive: 0,
            byRole: {
                admin: 0,
                manager: 0,
                waiter: 0,
                chef: 0,
                cashier: 0,
            },
        };

        staffList.forEach((staff) => {
            // Count active/inactive
            if (staff.isActive) {
                stats.active++;
            } else {
                stats.inactive++;
            }

            // Count by role
            if (staff.role in stats.byRole) {
                stats.byRole[staff.role as Role]++;
            }
        });

        return stats;
    }, [staffList]);
}
