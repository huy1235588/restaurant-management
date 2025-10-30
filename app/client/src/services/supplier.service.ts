import axios from '@/lib/axios';
import type {
    Supplier,
    CreateSupplierDto,
    UpdateSupplierDto,
    PaginatedResponse,
} from '@/types';

export interface SupplierQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}

export const supplierService = {
    /**
     * Get all suppliers with filters
     */
    async getAll(params?: SupplierQueryParams): Promise<PaginatedResponse<Supplier>> {
        const response = await axios.get('/suppliers', { params });
        return response.data.data;
    },

    /**
     * Get supplier by ID
     */
    async getById(id: number): Promise<Supplier> {
        const response = await axios.get(`/suppliers/${id}`);
        return response.data.data;
    },

    /**
     * Get active suppliers
     */
    async getActive(): Promise<Supplier[]> {
        const response = await axios.get('/suppliers/active');
        return response.data.data;
    },

    /**
     * Create new supplier
     */
    async create(data: CreateSupplierDto): Promise<Supplier> {
        const response = await axios.post('/suppliers', data);
        return response.data.data;
    },

    /**
     * Update supplier
     */
    async update(id: number, data: UpdateSupplierDto): Promise<Supplier> {
        const response = await axios.patch(`/suppliers/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete supplier
     */
    async delete(id: number): Promise<void> {
        await axios.delete(`/suppliers/${id}`);
    },
};

export default supplierService;
