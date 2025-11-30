import { MenuItem, Category } from '@/types';

// Filter types
// NOTE: Backend only supports categoryId, isAvailable, isActive, search
// Other filters (minPrice, maxPrice, isVegetarian, spicyLevel) are defined
// for future implementation but not yet supported by backend
export interface MenuFilters {
    categoryId?: number;
    isAvailable?: boolean;
    isActive?: boolean;
    search?: string;
    // Future filters (not yet implemented in backend):
    // minPrice?: number;
    // maxPrice?: number;
    // isVegetarian?: boolean;
    // spicyLevel?: number;
}

// Form data types
export interface MenuItemFormData {
    itemCode: string;
    itemName: string;
    categoryId: number;
    price: number;
    cost?: number | null;
    description?: string | null;
    imagePath?: string | null;
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
