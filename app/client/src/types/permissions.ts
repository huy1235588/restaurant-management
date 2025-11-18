import { UserRole } from './auth';

// Permission mapping for RBAC
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    admin: ['*'], // Full access
    manager: [
        'dashboard.read',
        'orders.read',
        'orders.create',
        'orders.update',
        'orders.delete',
        'kitchen.read',
        'tables.read',
        'tables.update',
        'menu.read',
        'menu.create',
        'menu.update',
        'menu.delete',
        'category.read',
        'reservations.read',
        'reservations.create',
        'reservations.update',
        'reservations.delete',
        'bills.read',
        'bills.create',
        'bills.update',
        'staff.read',
        'reports.read',
    ],
    waiter: [
        'dashboard.read',
        'orders.read',
        'orders.create',
        'orders.update',
        'kitchen.read',
        'menu.read',
        'tables.read',
        'tables.update',
        'reservations.read',
        'reservations.create',
        'bills.read',
    ],
    chef: [
        'kitchen.read',
        'orders.read',
        'orders.update',
        'menu.read',
    ],
    cashier: [
        'dashboard.read',
        'orders.read',
        'bills.read',
        'bills.create',
        'bills.update',
    ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions.includes('*') || permissions.includes(permission);
}
