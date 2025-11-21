import { Order } from './order';

// Table Types
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export interface Table {
    tableId: number;
    tableNumber: string;
    tableName?: string;
    capacity: number;
    minCapacity?: number;
    floor?: number;
    section?: string;
    status: TableStatus;
    isActive: boolean;
    qrCode?: string;
    currentOrder?: Order;
    createdAt: string;
    updatedAt: string;
}

// Socket Events
export interface SocketTable {
    tableId: number;
    status: TableStatus;
    tableNumber: string;
}
