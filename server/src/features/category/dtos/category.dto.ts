export interface CreateCategoryDto {
    categoryName: string;
    description?: string;
    displayOrder?: number;
    isActive?: boolean;
    imageUrl?: string;
}

export interface UpdateCategoryDto {
    categoryName?: string;
    description?: string;
    displayOrder?: number;
    isActive?: boolean;
    imageUrl?: string;
}

export interface CategoryResponseDto {
    categoryId: number;
    categoryName: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    menuItems?: Array<{
        itemId: number;
        itemName: string;
        price: number;
    }>;
}

export interface CategoryFilterDto {
    isActive?: boolean;
}
