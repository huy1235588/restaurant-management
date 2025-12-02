/**
 * Restaurant Settings Types
 */

export interface OperatingHours {
    day: string;
    hours: string;
}

export interface SocialLink {
    platform: string;
    url: string;
    icon: string;
}

export interface Highlight {
    icon: string;
    label: string;
    value: string;
}

export interface BankConfig {
    bankId?: string;
    bankName?: string;
    accountNo?: string;
    accountName?: string;
    template?: string;
}

export interface RestaurantSettings {
    id: number;
    name: string;
    tagline?: string | null;
    description?: string | null;
    aboutTitle?: string | null;
    aboutContent?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    mapEmbedUrl?: string | null;
    heroImage?: string | null;
    aboutImage?: string | null;
    logoUrl?: string | null;
    operatingHours?: OperatingHours[] | null;
    socialLinks?: SocialLink[] | null;
    highlights?: Highlight[] | null;
    bankConfig?: BankConfig | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateRestaurantSettingsDto {
    name: string;
    tagline?: string;
    description?: string;
    aboutTitle?: string;
    aboutContent?: string;
    address?: string;
    phone?: string;
    email?: string;
    mapEmbedUrl?: string;
    heroImage?: string;
    aboutImage?: string;
    logoUrl?: string;
    operatingHours?: OperatingHours[];
    socialLinks?: SocialLink[];
    highlights?: Highlight[];
    bankConfig?: BankConfig;
}

// Form data types matching the DTO
export type SettingsFormData = UpdateRestaurantSettingsDto;
