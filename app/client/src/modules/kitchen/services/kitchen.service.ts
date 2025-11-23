import axiosInstance from "@/lib/axios";
import { KitchenOrder, KitchenOrderFilters } from "../types/kitchen.types";

/**
 * Kitchen API Service
 * Provides methods to interact with the kitchen backend endpoints
 */
export const kitchenApi = {
  /**
   * Get all kitchen orders with optional filters
   */
  async getAll(filters?: KitchenOrderFilters): Promise<KitchenOrder[]> {
    const response = await axiosInstance.get("/kitchen/orders", {
      params: filters,
    });
    return response.data.data || response.data;
  },

  /**
   * Get a single kitchen order by ID
   */
  async getById(id: number): Promise<KitchenOrder> {
    const response = await axiosInstance.get(`/kitchen/orders/${id}`);
    return response.data.data || response.data;
  },

  /**
   * Start preparing an order
   * @param id - Kitchen order ID
   */
  async startPreparing(id: number): Promise<KitchenOrder> {
    const response = await axiosInstance.patch(
      `/kitchen/orders/${id}/start`
    );
    return response.data.data || response.data;
  },

  /**
   * Mark an order as ready for pickup
   * @param id - Kitchen order ID
   */
  async markReady(id: number): Promise<KitchenOrder> {
    const response = await axiosInstance.patch(`/kitchen/orders/${id}/ready`);
    return response.data.data || response.data;
  },

  /**
   * Mark an order as completed (picked up by waiter)
   * @param id - Kitchen order ID
   */
  async markCompleted(id: number): Promise<KitchenOrder> {
    const response = await axiosInstance.patch(
      `/kitchen/orders/${id}/complete`
    );
    return response.data.data || response.data;
  },

  /**
   * Cancel a kitchen order
   * @param id - Kitchen order ID
   */
  async cancel(id: number): Promise<KitchenOrder> {
    const response = await axiosInstance.patch(
      `/kitchen/orders/${id}/cancel`
    );
    return response.data.data || response.data;
  },
};
