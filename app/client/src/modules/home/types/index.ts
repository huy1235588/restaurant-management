// Types for the home module

import { MenuItem, Category } from "@/types";

// Featured menu item type (subset of MenuItem for display)
export interface FeaturedMenuItem {
    itemId: number;
    itemCode: string;
    itemName: string;
    price: number;
    description?: string | null;
    imagePath?: string | null;
    spicyLevel?: number | null;
    isVegetarian: boolean;
    category?: {
        categoryId: number;
        categoryName: string;
    };
}

// Operating hours
export interface OperatingHoursData {
    day: string;
    hours: string;
}

// Social link
export interface SocialLinkData {
    platform: string;
    url: string;
    icon: string;
}

// Highlight data
export interface HighlightData {
    icon: string;
    label: string;
    value: string;
}

// Restaurant settings response from API
export interface RestaurantSettingsApiResponse {
    id: number;
    name: string;
    tagline: string | null;
    description: string | null;
    aboutTitle: string | null;
    aboutContent: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    mapEmbedUrl: string | null;
    heroImage: string | null;
    aboutImage: string | null;
    logoUrl: string | null;
    operatingHours: OperatingHoursData[];
    socialLinks: SocialLinkData[];
    highlights: HighlightData[];
    createdAt: string;
    updatedAt: string;
}

// Reservation form data
export interface ReservationFormData {
    customerName: string;
    phoneNumber: string;
    email?: string;
    reservationDate: Date;
    reservationTime: string;
    partySize: number;
    specialRequest?: string;
}

// Reservation response from API
export interface ReservationResponse {
    reservationId: number;
    reservationCode: string;
    customerName: string;
    phoneNumber: string;
    email?: string | null;
    reservationDate: string;
    reservationTime: string;
    partySize: number;
    specialRequest?: string | null;
    status: "pending" | "confirmed" | "seated" | "completed" | "cancelled" | "no_show";
    createdAt: string;
}

// API Response wrapper
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// Paginated response for menu items
export interface PaginatedMenuResponse {
    items: FeaturedMenuItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
