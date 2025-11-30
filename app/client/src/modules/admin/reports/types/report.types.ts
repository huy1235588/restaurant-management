// Types for Reports module

export type GroupBy = 'day' | 'week' | 'month' | 'hour' | 'status';

export type PaymentMethod = 'cash' | 'card' | 'momo' | 'bank_transfer';

// Query params
export interface ReportQueryParams {
    startDate?: string;
    endDate?: string;
}

export interface RevenueQueryParams extends ReportQueryParams {
    groupBy?: GroupBy;
}

export interface TopItemsQueryParams extends ReportQueryParams {
    limit?: number;
}

export interface OrdersQueryParams extends ReportQueryParams {
    groupBy?: GroupBy;
}

// API Response types
export interface OverviewReport {
    revenue: number;
    orders: number;
    reservations: number;
    avgOrderValue: number;
    comparison: {
        revenue: number;
        orders: number;
        reservations: number;
        avgOrderValue: number;
    };
}

export interface RevenueDataPoint {
    date: string;
    revenue: number;
    orders: number;
}

export interface RevenueReport {
    data: RevenueDataPoint[];
    total: number;
    growth: number;
}

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

export interface OrdersDataPoint {
    label: string;
    count: number;
    amount: number;
}

export interface OrdersReport {
    data: OrdersDataPoint[];
    summary: {
        totalOrders: number;
        totalAmount: number;
        avgOrderValue: number;
        avgPrepTime?: number;
    };
}

// API Response wrapper
export interface ApiResponse<T> {
    message: string;
    data: T;
}

// Date range presets
export type DateRangePreset = 'today' | 'week' | 'month' | 'custom';

export interface DateRange {
    startDate: string;
    endDate: string;
    preset: DateRangePreset;
}
