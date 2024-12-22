// Order
export interface MenuFood {
    itemId: string;
    itemName: string;
    category: string;
    price: number;
}

export interface Cart {
    itemId: string;
    itemName: string;
    itemPrice: number;
    itemQuantity: number;
    status: 'pending' | 'completed' | 'error';
    total: number;
}

export interface CartOrder {
    tableId: number | null;
    itemId: string;
    itemName: string;
    itemQuantity: number;
    orderAt: Date;
}

export interface OrderStatus {
    tableId: number;
    itemId: string;
    status: 'pending' | 'completed' | 'error';
}