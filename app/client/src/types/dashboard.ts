// Dashboard Statistics
export interface DashboardStats {
    todayRevenue: number;
    todayOrders: number;
    activeOrders: number;
    availableTables: number;
    pendingReservations: number;
}

export interface RevenueChartData {
    date: string;
    revenue: number;
    orders: number;
}

export interface CategorySalesData {
    categoryName: string;
    sales: number;
    percentage: number;
}
