// Dashboard Types

// API Response wrapper
export interface ApiResponse<T> {
    message: string;
    data: T;
}

// Table Summary
export interface TableSummary {
    total: number;
    available: number;
    occupied: number;
    reserved: number;
    maintenance: number;
}

// Kitchen Queue
export interface KitchenQueueData {
    pending: number;
    preparing: number;
    ready: number;
}

// Dashboard Status
export interface DashboardStatus {
    tables: TableSummary;
    kitchen: KitchenQueueData;
}

// Activity Metadata
export interface ActivityMetadata {
    entityId: number;
    amount?: number;
    status?: string;
    tableName?: string;
}

// Activity Item
export interface ActivityItem {
    id: string;
    type: 'order' | 'reservation' | 'payment';
    action: string;
    description: string;
    timestamp: string;
    metadata: ActivityMetadata;
}

// Recent Activity Response
export interface RecentActivityResponse {
    activities: ActivityItem[];
}

// Query Params
export interface RecentActivityQueryParams {
    limit?: number;
}

// Today Stats (reuse from reports)
export interface TodayStatsData {
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
