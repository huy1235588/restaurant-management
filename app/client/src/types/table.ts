// Table Types - Aligned with Backend Prisma Schema

// TableStatus enum matching backend
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

// Main Table interface matching backend RestaurantTable model
export interface Table {
    tableId: number;
    tableNumber: string;
    tableName: string | null;
    capacity: number;
    minCapacity: number;
    floor: number;
    section: string | null;
    status: TableStatus;
    qrCode: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// DTOs for API requests - matching backend DTOs
export interface CreateTableDto {
    tableNumber: string;
    tableName?: string;
    capacity: number;
    minCapacity?: number;
    floor?: number;
    section?: string;
}

export interface UpdateTableDto {
    tableNumber?: string;
    tableName?: string;
    capacity?: number;
    minCapacity?: number;
    floor?: number;
    section?: string;
}

export interface UpdateTableStatusDto {
    status: TableStatus;
}

// Filter interface for table queries
export interface TableFilters {
    floor?: number;
    section?: string;
    status?: TableStatus;
    capacity?: number;
    minCapacity?: number;
    maxCapacity?: number;
    search?: string;
}

// Options for pagination and sorting
export interface TableQueryOptions {
    filters?: TableFilters;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Stats response
export interface TableStats {
    total: number;
    available: number;
    occupied: number;
    reserved: number;
    maintenance: number;
    active: number;
    inactive: number;
    totalCapacity: number;
    occupancyRate: string;
}
