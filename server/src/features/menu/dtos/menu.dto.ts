export interface CreateMenuItemDto {
    itemCode: string;
    itemName: string;
    categoryId: number;
    price: number;
    cost?: number;
    description?: string;
    imageUrl?: string;
    isAvailable?: boolean;
    isActive?: boolean;
    preparationTime?: number;
    spicyLevel?: number;
    isVegetarian?: boolean;
    calories?: number;
    displayOrder?: number;
}

export interface UpdateMenuItemDto {
    itemCode?: string;
    itemName?: string;
    categoryId?: number;
    price?: number;
    cost?: number;
    description?: string;
    imageUrl?: string;
    isAvailable?: boolean;
    isActive?: boolean;
    preparationTime?: number;
    spicyLevel?: number;
    isVegetarian?: boolean;
    calories?: number;
    displayOrder?: number;
}

export interface MenuItemResponseDto {
    itemId: number;
    itemCode: string;
    itemName: string;
    categoryId: number;
    price: number;
    cost?: number;
    description?: string;
    imageUrl?: string;
    isAvailable: boolean;
    isActive: boolean;
    preparationTime?: number;
    spicyLevel?: number;
    isVegetarian: boolean;
    calories?: number;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
    category?: {
        categoryId: number;
        categoryName: string;
    };
}

export interface MenuItemFilterDto {
    categoryId?: number;
    isAvailable?: boolean;
    isActive?: boolean;
    search?: string;
}
