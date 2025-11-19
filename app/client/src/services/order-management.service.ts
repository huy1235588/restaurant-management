/**
 * Order Management Service
 * 
 * This file is deprecated. Please use @/services/order.service instead.
 * All types have been moved to @/types/order
 * 
 * This file is kept for backward compatibility.
 * It will be removed in a future version.
 */

import { orderApi } from './order.service';

/**
 * @deprecated Use orderApi from @/services/order.service instead
 */
export const orderManagementApi = orderApi;

// Re-export types for backward compatibility
export type {
    Order,
    OrderItem,
    OrderStatus,
    CreateOrderDto,
    UpdateOrderDto,
    AddOrderItemsDto,
    CancelOrderDto,
    OrderReportByTable as SalesByTableReport,
    OrderReportPopularItems as PopularItemsReport,
    OrderReportByWaiter as WaiterPerformanceReport,
    OrderReportCustomerHistory as CustomerHistoryReport,
} from '@/types/order';
