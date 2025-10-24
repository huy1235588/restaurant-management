import axios from '@/lib/axios';
import type {
    PurchaseOrder,
    CreatePurchaseOrderDto,
    UpdatePurchaseOrderDto,
    ReceivePurchaseOrderDto,
    PurchaseOrderStatus,
    PaginatedResponse,
} from '@/types';

export interface PurchaseOrderQueryParams {
    page?: number;
    limit?: number;
    supplierId?: number;
    status?: PurchaseOrderStatus;
    fromDate?: string;
    toDate?: string;
}

export const purchaseOrderService = {
    /**
     * Get all purchase orders with filters
     */
    async getAll(params?: PurchaseOrderQueryParams): Promise<PaginatedResponse<PurchaseOrder>> {
        const response = await axios.get('/purchase-orders', { params });
        return response.data.data;
    },

    /**
     * Get purchase order by ID
     */
    async getById(id: number): Promise<PurchaseOrder> {
        const response = await axios.get(`/purchase-orders/${id}`);
        return response.data.data;
    },

    /**
     * Get purchase order by order number
     */
    async getByNumber(orderNumber: string): Promise<PurchaseOrder> {
        const response = await axios.get(`/purchase-orders/number/${orderNumber}`);
        return response.data.data;
    },

    /**
     * Get pending purchase orders
     */
    async getPending(): Promise<PurchaseOrder[]> {
        const response = await axios.get('/purchase-orders/pending');
        return response.data.data;
    },

    /**
     * Create new purchase order
     */
    async create(data: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
        const response = await axios.post('/purchase-orders', data);
        return response.data.data;
    },

    /**
     * Update purchase order
     */
    async update(id: number, data: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
        const response = await axios.patch(`/purchase-orders/${id}`, data);
        return response.data.data;
    },

    /**
     * Receive purchase order (mark as received and update stock)
     */
    async receive(id: number, data: ReceivePurchaseOrderDto): Promise<PurchaseOrder> {
        const response = await axios.post(`/purchase-orders/${id}/receive`, data);
        return response.data.data;
    },

    /**
     * Cancel purchase order
     */
    async cancel(id: number): Promise<PurchaseOrder> {
        const response = await axios.post(`/purchase-orders/${id}/cancel`);
        return response.data.data;
    },

    /**
     * Delete purchase order (only pending orders)
     */
    async delete(id: number): Promise<void> {
        await axios.delete(`/purchase-orders/${id}`);
    },
};

export default purchaseOrderService;
