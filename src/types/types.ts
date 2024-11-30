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
    price: number;
    quantity: number;
    status: 'pending' | 'cooking' | 'completed' | 'error';
    total: number;
}

export interface CartOrder{
    tableId: string | null ;
    itemId: string;
    itemName: string;
    quantity: number;
    orderAt: Date;
}

export interface OrderStatus {
    tableId: string;
    itemId: string;
    status: 'pending' | 'cooking' | 'completed' | 'error';
}