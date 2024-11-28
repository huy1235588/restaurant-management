// Order
export interface MenuFood {
    id: string;
    itemName: string;
    category: string;
    price: number;
}

export interface Cart {
    id: string;
    itemName: string;
    quantity: number;
    price: number;
    status: 'pending' | 'cooking' | 'completed' | 'error';
    total: number;
}

export interface CartOrder{
    tableId: string | null ;
    itemId: string;
    itemName: string;
    quantity: number;
    timeSubmitted: Date;
}

export interface OrderStatus {
    tableId: string;
    itemId: string;
    status: 'pending' | 'cooking' | 'completed' | 'error';
}