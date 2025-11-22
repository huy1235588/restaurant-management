import { KitchenOrderStatus } from '../types';

export const KITCHEN_STATUS_LABELS: Record<KitchenOrderStatus, string> = {
    [KitchenOrderStatus.PENDING]: 'Pending',
    [KitchenOrderStatus.READY]: 'Ready',
    [KitchenOrderStatus.COMPLETED]: 'Completed',
    [KitchenOrderStatus.CANCELLED]: 'Cancelled',
};

export const KITCHEN_STATUS_COLORS: Record<KitchenOrderStatus, 'default' | 'secondary' | 'success' | 'destructive'> = {
    [KitchenOrderStatus.PENDING]: 'default',
    [KitchenOrderStatus.READY]: 'secondary',
    [KitchenOrderStatus.COMPLETED]: 'success',
    [KitchenOrderStatus.CANCELLED]: 'destructive',
};

export function getElapsedTime(createdAt: string): string {
    const elapsed = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(elapsed / 60000);
    return `${minutes} min`;
}

export function getPriorityColor(priority: string): string {
    switch (priority) {
        case 'high':
            return 'text-red-600';
        case 'urgent':
            return 'text-red-700 font-bold';
        default:
            return 'text-gray-600';
    }
}
