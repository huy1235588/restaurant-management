import { PaymentMethod } from '@/lib/prisma';

// Overview Report Types
export interface OverviewReport {
    revenue: number;
    orders: number;
    reservations: number;
    avgOrderValue: number;
    comparison: {
        revenue: number; // percentage change
        orders: number;
        reservations: number;
        avgOrderValue: number;
    };
}

// Revenue Report Types
export interface RevenueDataPoint {
    date: string;
    revenue: number;
    orders: number;
}

export interface RevenueReport {
    data: RevenueDataPoint[];
    total: number;
    growth: number; // percentage change from previous period
}

// Top Items Report Types
export interface TopItemData {
    itemId: number;
    itemCode: string;
    name: string;
    categoryName: string;
    quantity: number;
    revenue: number;
}

export interface TopItemsReport {
    items: TopItemData[];
    totalQuantity: number;
    totalRevenue: number;
}

// Payment Methods Report Types
export interface PaymentMethodData {
    method: PaymentMethod;
    count: number;
    amount: number;
    percentage: number;
}

export interface PaymentMethodsReport {
    methods: PaymentMethodData[];
    totalAmount: number;
    totalCount: number;
}

// Orders Report Types
export interface OrdersDataPoint {
    label: string; // hour (0-23), day name, or status
    count: number;
    amount: number;
}

export interface OrdersReport {
    data: OrdersDataPoint[];
    summary: {
        totalOrders: number;
        totalAmount: number;
        avgOrderValue: number;
        avgPrepTime?: number; // in minutes
    };
}

// Date range helper
export interface DateRange {
    startDate: Date;
    endDate: Date;
}
