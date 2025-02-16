// Menu
export interface MenuFood {
    itemId: string;
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

export interface TableBooking {
    tableId: number | null;
    billId: number;
    customerName: string;
    specialRequest?: "",
    reservedDate?: string;
    reservedTime?: string;
    numberOfGuests: number;
    tableStatus: "occupied" | "reserved";
}

export interface Reservation {
    tableId: RestaurantTables['tableId'];
    billId: number;
    customerName: string;
    reservationDate?: string;
    reservationTime?: string;
    headCount: number;
    specialRequest?: "",
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

export interface Bills {
    id: number;
    staffId: number;
    reservationId: number;
    tableId: number;
    cardId: number;
    totalAmount: number;
    billTime: Date;
    paymentMethod: 'cash' | 'card';
}

export interface BillItem {
    id?: number;
    billID: number;
    itemId: string;
    itemName: string;
    itemPrice: number;
    quantity: number;
}

export interface KitchenOrder {
    id?: number;
    billID: number;
    staffId: number;
    itemId: string;
    itemName: string;
    itemPrice: number;
    quantity: number;
    orderTime: Date;
    status: 'pending' | 'completed' | 'error';
    cancelReason?: string;
    totalPrice?: number;
    tableId?: number;
}