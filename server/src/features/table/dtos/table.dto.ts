export interface CreateTableDto {
    tableNumber: string;
    tableName?: string;
    capacity: number;
    minCapacity?: number;
    floor?: number;
    section?: string;
    status?: 'available' | 'occupied' | 'reserved' | 'maintenance';
    qrCode?: string;
    isActive?: boolean;
}

export interface UpdateTableDto {
    tableNumber?: string;
    tableName?: string;
    capacity?: number;
    minCapacity?: number;
    floor?: number;
    section?: string;
    status?: 'available' | 'occupied' | 'reserved' | 'maintenance';
    qrCode?: string;
    isActive?: boolean;
}

export interface TableResponseDto {
    tableId: number;
    tableNumber: string;
    tableName?: string;
    capacity: number;
    minCapacity: number;
    floor: number;
    section?: string;
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    qrCode?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
