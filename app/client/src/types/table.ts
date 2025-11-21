// Table Types - Aligned with Backend Prisma Schema

// TableStatus enum matching backend
export type TableStatus = "available" | "occupied" | "reserved" | "maintenance";

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
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// DTOs for API requests - matching backend DTOs
// Note: minCapacity and floor have default values in DB (both default to 1)
export interface CreateTableDto {
    tableNumber: string; // Required, unique, max 20 chars
    tableName?: string; // Optional, max 50 chars
    capacity: number; // Required, min 1, max 50
    minCapacity?: number; // Optional, min 1, defaults to 1
    floor?: number; // Optional, min 1, defaults to 1
    section?: string; // Optional, max 50 chars (VIP, Garden, Indoor, Outdoor)
}

export interface UpdateTableDto {
    tableNumber?: string; // Optional, unique, max 20 chars
    tableName?: string; // Optional, max 50 chars
    capacity?: number; // Optional, min 1, max 50
    minCapacity?: number; // Optional, min 1
    floor?: number; // Optional, min 1
    section?: string; // Optional, max 50 chars
}

export interface UpdateTableStatusDto {
    status: TableStatus;
}

export interface BulkUpdateStatusDto {
    tableIds: number[]; // Array of table IDs
    status: TableStatus; // New status for all tables
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
    sortOrder?: "asc" | "desc";
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
