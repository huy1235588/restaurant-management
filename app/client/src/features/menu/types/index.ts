import { MenuItem, Category } from '@/types';

// Filter types
export interface MenuFilters {
    categoryId?: number;
    isAvailable?: boolean;
    isActive?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    isVegetarian?: boolean;
    spicyLevel?: number;
    preparationTime?: 'quick' | 'normal' | 'long';
}

// Form data types
export interface MenuItemFormData {
    itemCode: string;
    itemName: string;
    categoryId: number;
    price: number;
    cost?: number | null;
    description?: string | null;
    imageUrl?: string | null;
    isAvailable: boolean;
    isActive: boolean;
    preparationTime?: number | null;
    spicyLevel?: number | null;
    isVegetarian: boolean;
    calories?: number | null;
    displayOrder?: number | null;
}

// View mode type
export type ViewMode = 'grid' | 'list' | 'table';

// Statistics type
export interface MenuStatisticsData {
    total: number;
    available: number;
    outOfStock: number;
    newThisMonth: number;
}

// Sort options
export interface SortOption {
    field: string;
    order: 'asc' | 'desc';
    label: string;
}

// Re-export for convenience
export type { MenuItem, Category };
