import { Category } from '@/types';

// Form data types
export interface CategoryFormData {
    categoryName: string;
    description?: string | null;
    displayOrder?: number | null;
    isActive: boolean;
    imagePath?: string | null;
}
