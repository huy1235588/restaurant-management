import axiosInstance from '@/lib/axios';
import { 
    Order, 
    OrderFormData, 
    CreateOrderDto,
    UpdateOrderDto,
    AddOrderItemsDto,
    CancelOrderDto,
    OrderStatus,
    OrderReportByTable,
    OrderReportPopularItems,
    OrderReportByWaiter,
    OrderReportCustomerHistory,
    OrderItem
} from '@/types/order';
import { ApiResponse, PaginatedResponse } from '@/types';

// Helper function to convert string prices to numbers in OrderItem
const normalizeOrderItem = (item: any): OrderItem => ({
    ...item,
    unitPrice: typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice,
    totalPrice: typeof item.totalPrice === 'string' ? parseFloat(item.totalPrice) : item.totalPrice,
    menuItem: item.menuItem ? {
        ...item.menuItem,
        price: typeof item.menuItem.price === 'string' ? parseFloat(item.menuItem.price) : item.menuItem.price,
    } : item.menuItem,
});

// Helper function to convert string prices to numbers in Order
const normalizeOrder = (order: any): Order => ({
    ...order,
    totalAmount: typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount,
    discountAmount: typeof order.discountAmount === 'string' ? parseFloat(order.discountAmount) : order.discountAmount,
    taxAmount: typeof order.taxAmount === 'string' ? parseFloat(order.taxAmount) : order.taxAmount,
    finalAmount: typeof order.finalAmount === 'string' ? parseFloat(order.finalAmount) : order.finalAmount,
    orderItems: order.orderItems?.map(normalizeOrderItem) || [],
});

// Helper function to normalize array of orders
const normalizeOrders = (orders: any[]): Order[] => orders.map(normalizeOrder);

// Helper function to convert prices in report data
const normalizeOrderReportByTable = (report: any): OrderReportByTable => ({
    ...report,
    totalRevenue: typeof report.totalRevenue === 'string' ? parseFloat(report.totalRevenue) : report.totalRevenue,
    averageOrderValue: typeof report.averageOrderValue === 'string' ? parseFloat(report.averageOrderValue) : report.averageOrderValue,
});

const normalizeOrderReportPopularItems = (report: any): OrderReportPopularItems => ({
    ...report,
    totalRevenue: typeof report.totalRevenue === 'string' ? parseFloat(report.totalRevenue) : report.totalRevenue,
});

const normalizeOrderReportByWaiter = (report: any): OrderReportByWaiter => ({
    ...report,
    totalRevenue: typeof report.totalRevenue === 'string' ? parseFloat(report.totalRevenue) : report.totalRevenue,
    averageOrderValue: typeof report.averageOrderValue === 'string' ? parseFloat(report.averageOrderValue) : report.averageOrderValue,
});

const normalizeOrderReportCustomerHistory = (report: any): OrderReportCustomerHistory => ({
    ...report,
    totalSpent: typeof report.totalSpent === 'string' ? parseFloat(report.totalSpent) : report.totalSpent,
    averageOrderValue: typeof report.averageOrderValue === 'string' ? parseFloat(report.averageOrderValue) : report.averageOrderValue,
    orders: report.orders?.map(normalizeOrder) || [],
});

/**
 * Order API Service - Synced with Backend API
 */
export const orderApi = {
    // ========== Order CRUD ==========
    
    /**
     * Get all orders with filters and pagination
     */
    getAll: async (params?: {
        tableId?: number;
        status?: OrderStatus;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<PaginatedResponse<Order>> => {
        const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Order>>>(
            '/orders',
            { params }
        );
        return {
            ...response.data.data,
            items: normalizeOrders(response.data.data.items),
        };
    },

    /**
     * Get order by ID
     */
    getById: async (id: number): Promise<Order> => {
        const response = await axiosInstance.get<ApiResponse<Order>>(`/orders/${id}`);
        return normalizeOrder(response.data.data);
    },

    /**
     * Create order
     */
    create: async (data: CreateOrderDto): Promise<Order> => {
        const response = await axiosInstance.post<ApiResponse<Order>>('/orders', data);
        return normalizeOrder(response.data.data);
    },

    /**
     * Update order
     */
    update: async (id: number, data: UpdateOrderDto): Promise<Order> => {
        const response = await axiosInstance.put<ApiResponse<Order>>(`/orders/${id}`, data);
        return normalizeOrder(response.data.data);
    },

    /**
     * Update order status
     */
    updateStatus: async (id: number, status: OrderStatus): Promise<Order> => {
        const response = await axiosInstance.patch<ApiResponse<Order>>(
            `/orders/${id}/status`,
            { status }
        );
        return normalizeOrder(response.data.data);
    },

    /**
     * Delete order (Admin/Manager only)
     */
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/orders/${id}`);
    },

    // ========== Order Items Management ==========

    /**
     * Add items to existing order
     */
    addItems: async (id: number, data: AddOrderItemsDto): Promise<Order> => {
        const response = await axiosInstance.post<ApiResponse<Order>>(
            `/orders/${id}/items`,
            data
        );
        return normalizeOrder(response.data.data);
    },

    /**
     * Update order item status
     */
    updateItemStatus: async (orderId: number, itemId: number, status: OrderStatus): Promise<Order> => {
        const response = await axiosInstance.patch<ApiResponse<Order>>(
            `/orders/${orderId}/items/${itemId}/status`,
            { status }
        );
        return normalizeOrder(response.data.data);
    },

    /**
     * Cancel order with reason
     */
    cancel: async (id: number, reason?: string): Promise<Order> => {
        const response = await axiosInstance.post<ApiResponse<Order>>(
            `/orders/${id}/cancel`,
            { reason }
        );
        return normalizeOrder(response.data.data);
    },

    // ========== Reports ==========

    /**
     * Get orders report by table
     */
    getReportByTable: async (params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<OrderReportByTable[]> => {
        const response = await axiosInstance.get<ApiResponse<OrderReportByTable[]>>(
            '/orders/reports/by-table',
            { params }
        );
        return response.data.data.map(normalizeOrderReportByTable);
    },

    /**
     * Get popular items report
     */
    getReportPopularItems: async (params?: {
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<OrderReportPopularItems[]> => {
        const response = await axiosInstance.get<ApiResponse<OrderReportPopularItems[]>>(
            '/orders/reports/popular-items',
            { params }
        );
        return response.data.data.map(normalizeOrderReportPopularItems);
    },

    /**
     * Get waiter performance report
     */
    getReportByWaiter: async (params?: {
        startDate?: string;
        endDate?: string;
        staffId?: number;
    }): Promise<OrderReportByWaiter[]> => {
        const response = await axiosInstance.get<ApiResponse<OrderReportByWaiter[]>>(
            '/orders/reports/by-waiter',
            { params }
        );
        return response.data.data.map(normalizeOrderReportByWaiter);
    },

    /**
     * Get customer order history by phone
     */
    getReportCustomerHistory: async (phone: string): Promise<OrderReportCustomerHistory> => {
        const response = await axiosInstance.get<ApiResponse<OrderReportCustomerHistory>>(
            `/orders/reports/customer-history/${phone}`
        );
        return normalizeOrderReportCustomerHistory(response.data.data);
    },
};
