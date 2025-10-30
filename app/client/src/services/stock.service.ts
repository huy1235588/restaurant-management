import axios from '@/lib/axios';
import type {
    StockTransaction,
    IngredientBatch,
    StockAlert,
    CreateStockTransactionDto,
    StockAdjustmentDto,
    TransactionType,
    StockAlertType,
    PaginatedResponse,
} from '@/types';

export interface StockTransactionQueryParams {
    page?: number;
    limit?: number;
    ingredientId?: number;
    transactionType?: TransactionType;
    fromDate?: string;
    toDate?: string;
}

export interface StockAlertQueryParams {
    page?: number;
    limit?: number;
    alertType?: StockAlertType;
    isResolved?: boolean;
}

export const stockService = {
    // ============================================
    // TRANSACTION APIS
    // ============================================

    /**
     * Get all stock transactions with filters
     */
    async getTransactions(
        params?: StockTransactionQueryParams
    ): Promise<PaginatedResponse<StockTransaction>> {
        const response = await axios.get('/stock/transactions', { params });
        return response.data.data;
    },

    /**
     * Create manual stock transaction
     */
    async createTransaction(data: CreateStockTransactionDto): Promise<StockTransaction> {
        const response = await axios.post('/stock/transactions', data);
        return response.data.data;
    },

    /**
     * Adjust stock (inventory count)
     */
    async adjustStock(data: StockAdjustmentDto): Promise<StockTransaction> {
        const response = await axios.post('/stock/adjust', data);
        return response.data.data;
    },

    /**
     * Deduct stock for order
     */
    async deductStock(data: {
        ingredientId: number;
        quantity: number;
        orderId: number;
    }): Promise<StockTransaction> {
        const response = await axios.post('/stock/deduct', data);
        return response.data.data;
    },

    // ============================================
    // BATCH APIS
    // ============================================

    /**
     * Get all ingredient batches
     */
    async getBatches(ingredientId?: number): Promise<IngredientBatch[]> {
        const response = await axios.get('/stock/batches', {
            params: { ingredientId },
        });
        return response.data.data;
    },

    /**
     * Get expiring batches
     */
    async getExpiringBatches(days: number = 7): Promise<IngredientBatch[]> {
        const response = await axios.get('/stock/batches/expiring', {
            params: { days },
        });
        return response.data.data;
    },

    /**
     * Get expired batches
     */
    async getExpiredBatches(): Promise<IngredientBatch[]> {
        const response = await axios.get('/stock/batches/expired');
        return response.data.data;
    },

    // ============================================
    // ALERT APIS
    // ============================================

    /**
     * Get all stock alerts
     */
    async getAlerts(params?: StockAlertQueryParams): Promise<PaginatedResponse<StockAlert>> {
        const response = await axios.get('/stock/alerts', { params });
        return response.data.data;
    },

    /**
     * Resolve stock alert
     */
    async resolveAlert(id: number, notes?: string): Promise<StockAlert> {
        const response = await axios.post(`/stock/alerts/${id}/resolve`, { notes });
        return response.data.data;
    },

    /**
     * Check and create alerts (admin only)
     */
    async checkAlerts(): Promise<{ lowStock: number; message: string }> {
        const response = await axios.post('/stock/alerts/check');
        return response.data.data;
    },
};

export default stockService;
