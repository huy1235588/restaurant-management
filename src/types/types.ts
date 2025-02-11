// Menu
export interface MenuFood {
    itemId: number;
    itemName: string;
    categoryId: number;
    price: number;
    description: string;
}

// Category
export interface Category {
    id: number;
    categoryName: string;
}

// Restaurant Tables
export interface RestaurantTables {
    tableId: number;
    tableName: string;
    capacity: number;
    status: 'occupied' | 'reserved' | 'available';
}

export interface Cart {
    itemId: string;
    itemName: string;
    itemPrice: number;
    itemQuantity: number;
    status: 'pending' | 'completed' | 'error';
    total: number;
}

export interface TableBooking {
    tableId: number | null;
    billId: number;
    customerName: string;
    specialRequest?: "",
    reservedTime?: string;
    numberOfGuests: number;
    tableStatus: "occupied" | "reserved";
}

export interface Reservation {
    reservationId: number | null;
    tableId: number;
    customerName: string;
    specialRequest?: "",
    reservedTime?: string;
    numberOfGuests: number;
    tableStatus: "occupied" | "reserved";
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