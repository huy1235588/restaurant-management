// ============================================
// Authentication Types
// ============================================
export type { UserRole, User, LoginCredentials, AuthResponse, LoginFormData } from './auth';

// ============================================
// Order Types
// ============================================
export type { OrderStatus, OrderType, OrderFormData, SocketOrder } from './order';
export { type OrderItem, type Order } from './order';

// ============================================
// Menu Types
// ============================================
export { type MenuItem, type Category } from './menu';

// ============================================
// Table Types
// ============================================
export { type TableStatus, type Table, type SocketTable } from './table';

// ============================================
// Bill Types
// ============================================
export { type PaymentMethod, type PaymentStatus, type Payment, type Bill } from './bill';

// ============================================
// Reservation Types
// ============================================
export type {
    ReservationStatus,
    Customer,
    Reservation,
    ReservationAudit,
    AvailableTable,
    AvailabilityCheck,
    ReservationFormData,
    CreateReservationDto,
    UpdateReservationDto,
    CreateCustomerDto,
    UpdateCustomerDto,
} from './reservation';

// ============================================
// Kitchen Types
// ============================================
export { type KitchenOrder, type KitchenOrderItem } from './kitchen';

// ============================================
// Inventory Types
// ============================================
export {
    type IngredientCategory,
    type Ingredient,
    type Recipe,
    type Supplier,
    type PurchaseOrderStatus,
    type PurchaseOrderItem,
    type PurchaseOrder,
    type TransactionType,
    type StockTransaction,
    type IngredientBatch,
    type StockAlertType,
    type StockAlert,
    type CreateIngredientDto,
    type UpdateIngredientDto,
    type CreateSupplierDto,
    type UpdateSupplierDto,
    type CreatePurchaseOrderItemDto,
    type CreatePurchaseOrderDto,
    type UpdatePurchaseOrderDto,
    type ReceivePurchaseOrderItemDto,
    type ReceivePurchaseOrderDto,
    type StockAdjustmentDto,
    type CreateStockTransactionDto,
} from './inventory';

// ============================================
// Dashboard Types
// ============================================
export { type DashboardStats, type RevenueChartData, type CategorySalesData } from './dashboard';

// ============================================
// API Types
// ============================================
export { type ApiResponse, type PaginatedResponse, type ApiError } from './api';

// ============================================
// Permissions
// ============================================
export { ROLE_PERMISSIONS, hasPermission } from './permissions';