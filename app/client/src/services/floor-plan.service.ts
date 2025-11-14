import axiosInstance from '@/lib/axios';
import { ApiResponse } from '@/types';

export interface FloorPlanLayout {
    layoutId: number;
    floor: number;
    name: string;
    description?: string | null;
    data: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface TablePosition {
    tableId: number;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    shape?: string;
}

const BASE_URL = '/floor-plans';

export const floorPlanApi = {
    /**
     * Get all layouts for a floor
     */
    async getLayouts(floor: number): Promise<FloorPlanLayout[]> {
        const response = await axiosInstance.get<ApiResponse<FloorPlanLayout[]>>(
            `${BASE_URL}/layouts/${floor}`
        );
        return response.data.data;
    },

    /**
     * Get layout by ID
     */
    async getLayoutById(layoutId: number): Promise<FloorPlanLayout> {
        const response = await axiosInstance.get<ApiResponse<FloorPlanLayout>>(
            `${BASE_URL}/layouts/${layoutId}/detail`
        );
        return response.data.data;
    },

    /**
     * Create a new layout
     */
    async createLayout(
        floor: number,
        name: string,
        description: string | null | undefined,
        data: Record<string, any>
    ): Promise<FloorPlanLayout> {
        const response = await axiosInstance.post<ApiResponse<FloorPlanLayout>>(
            `${BASE_URL}/layouts`,
            {
                floor,
                name,
                description,
                data,
            }
        );
        return response.data.data;
    },

    /**
     * Update a layout
     */
    async updateLayout(
        layoutId: number,
        updates: {
            name?: string;
            description?: string | null;
            data?: Record<string, any>;
        }
    ): Promise<FloorPlanLayout> {
        const response = await axiosInstance.put<ApiResponse<FloorPlanLayout>>(
            `${BASE_URL}/layouts/${layoutId}`,
            updates
        );
        return response.data.data;
    },

    /**
     * Delete a layout
     */
    async deleteLayout(layoutId: number): Promise<void> {
        await axiosInstance.delete(`${BASE_URL}/layouts/${layoutId}`);
    },

    /**
     * Update table positions in bulk
     */
    async updateTablePositions(
        positions: TablePosition[]
    ): Promise<{ updated: number; tables: any[] }> {
        const response = await axiosInstance.patch<
            ApiResponse<{ updated: number; tables: any[] }>
        >(`${BASE_URL}/positions`, {
            positions,
        });
        return response.data.data;
    },
};
