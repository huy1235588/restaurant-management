import { UserRole } from './auth';

// Permission mapping for RBAC
// Aligned with backend RBAC matrix (docs/technical/RBAC_MATRIX.md)
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    admin: ['*'], // Full access
    manager: [
        // Dashboard
        'dashboard.read',
        // Orders
        'orders.read',
        'orders.create',
        'orders.update',
        'orders.delete', // Can cancel orders
        // Kitchen
        'kitchen.read',
        // Tables
        'tables.read',
        'tables.create',
        'tables.update',
        'tables.delete',
        // Menu
        'menu.read',
        'menu.create',
        'menu.update',
        'menu.delete',
        // Category
        'category.read',
        'category.create',
        'category.update',
        'category.delete',
        // Reservations
        'reservations.read',
        'reservations.create',
        'reservations.update',
        'reservations.cancel', // Can cancel/no-show reservations
        // Bills
        'bills.read',
        'bills.create',
        'bills.discount', // Can apply discounts
        'bills.payment',
        // Staff (view only, cannot create/delete)
        'staff.read',
        'staff.activate', // Can activate/deactivate
        // Reports
        'reports.read',
    ],
    waiter: [
        // Dashboard
        'dashboard.read',
        // Orders
        'orders.read',
        'orders.create',
        'orders.update', // Add items, cancel items, mark served
        // Kitchen (view only)
        'kitchen.read',
        // Menu (view only)
        'menu.read',
        // Tables (view only)
        'tables.read',
        // Category (view only)
        'category.read',
        // Reservations (create/update but not cancel)
        'reservations.read',
        'reservations.create',
        'reservations.update',
        // Bills (create only, no discount)
        'bills.read',
        'bills.create',
    ],
    chef: [
        // Kitchen (full access)
        'kitchen.read',
        'kitchen.update', // Start, complete, cancel kitchen orders
        // Orders (view only)
        'orders.read',
        // Menu (view only)
        'menu.read',
        // Category (view only)
        'category.read',
        // Tables (view only)
        'tables.read',
    ],
    cashier: [
        // Dashboard
        'dashboard.read',
        // Orders (view only)
        'orders.read',
        // Tables (view only)
        'tables.read',
        // Menu (view only)
        'menu.read',
        // Category (view only)
        'category.read',
        // Bills (full access except discount and delete)
        'bills.read',
        'bills.create',
        'bills.payment',
    ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions.includes('*') || permissions.includes(permission);
}
