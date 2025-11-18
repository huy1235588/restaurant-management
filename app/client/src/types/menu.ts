// Menu Types
export interface MenuItem {
    itemId: number;
    itemCode: string;
    itemName: string;
    categoryId: number;
    category?: Category;
    price: number;
    cost?: number;
    description?: string;
    imageUrl?: string;
    imagePath?: string;
    isAvailable: boolean;
    isActive: boolean;
    preparationTime?: number;
    spicyLevel?: number;
    isVegetarian?: boolean;
    calories?: number;
    displayOrder?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    categoryId: number;
    categoryName: string;
    description?: string;
    displayOrder?: number;
    isActive: boolean;
    imageUrl?: string;
    imagePath?: string;
    menuItems?: MenuItem[];
    createdAt: string;
    updatedAt: string;
}
