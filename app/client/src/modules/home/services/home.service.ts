import axios from "axios";
import type {
    FeaturedMenuItem,
    ReservationFormData,
    ReservationResponse,
    ApiResponse,
    PaginatedMenuResponse,
    RestaurantSettingsApiResponse,
} from "../types";

// Use relative API path - works with reverse proxy
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

// Create axios instance without auth interceptors (public endpoints)
const publicAxios = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

export const homeApi = {
    /**
     * Get restaurant settings for landing page
     * Returns restaurant information from database
     */
    getRestaurantSettings: async (): Promise<RestaurantSettingsApiResponse | null> => {
        try {
            const response = await publicAxios.get<ApiResponse<RestaurantSettingsApiResponse>>(
                "/restaurant-settings"
            );
            return response.data.data;
        } catch {
            // Return null if settings not found, will fallback to static config
            return null;
        }
    },

    /**
     * Get featured menu items for landing page
     * Returns limited items that are available and active
     */
    getFeaturedMenuItems: async (limit: number = 8): Promise<FeaturedMenuItem[]> => {
        const response = await publicAxios.get<ApiResponse<PaginatedMenuResponse>>(
            "/menu",
            {
                params: {
                    isAvailable: true,
                    isActive: true,
                    limit,
                    page: 1,
                    sortBy: "displayOrder",
                    sortOrder: "asc",
                },
            }
        );
        return response.data.data.items;
    },

    /**
     * Get menu items by category
     */
    getMenuByCategory: async (categoryId: number): Promise<FeaturedMenuItem[]> => {
        const response = await publicAxios.get<ApiResponse<FeaturedMenuItem[]>>(
            `/menu/category/${categoryId}`
        );
        return response.data.data;
    },

    /**
     * Get all active categories
     */
    getCategories: async (): Promise<{ categoryId: number; categoryName: string }[]> => {
        const response = await publicAxios.get<
            ApiResponse<{ categoryId: number; categoryName: string }[]>
        >("/categories", {
            params: {
                isActive: true,
            },
        });
        return response.data.data;
    },

    /**
     * Create a new reservation (public endpoint)
     */
    createReservation: async (
        data: ReservationFormData
    ): Promise<ReservationResponse> => {
        // Format date and time for API
        const formattedData = {
            customerName: data.customerName,
            phoneNumber: data.phoneNumber,
            email: data.email || undefined,
            reservationDate: data.reservationDate.toISOString().split("T")[0],
            reservationTime: data.reservationTime,
            partySize: data.partySize,
            specialRequest: data.specialRequest || undefined,
        };

        const response = await publicAxios.post<ApiResponse<ReservationResponse>>(
            "/reservations",
            formattedData
        );
        return response.data.data;
    },

    /**
     * Check reservation availability for a date/time
     */
    checkAvailability: async (params: {
        date: string;
        time: string;
        partySize: number;
    }): Promise<{ available: boolean; tables: any[] }> => {
        const response = await publicAxios.get<
            ApiResponse<{ available: boolean; tables: any[] }>
        >("/reservations/check-availability", {
            params: {
                date: params.date,
                time: params.time,
                partySize: params.partySize,
            },
        });
        return response.data.data;
    },
};
