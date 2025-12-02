import { z } from 'zod';

/**
 * Operating Hours validation schema
 */
export const operatingHoursSchema = z.object({
    day: z.string().min(1, 'Day is required').max(100),
    hours: z.string().min(1, 'Hours is required').max(50),
});

/**
 * Social Link validation schema
 */
export const socialLinkSchema = z.object({
    platform: z.string().min(1, 'Platform is required').max(50),
    url: z.string().url('Invalid URL format'),
    icon: z.string().min(1, 'Icon is required').max(50),
});

/**
 * Highlight validation schema
 */
export const highlightSchema = z.object({
    icon: z.string().min(1, 'Icon is required').max(10),
    label: z.string().min(1, 'Label is required').max(100),
    value: z.string().min(1, 'Value is required').max(50),
});

/**
 * Bank Config validation schema
 */
export const bankConfigSchema = z.object({
    bankId: z.string().max(20).optional().or(z.literal('')),
    bankName: z.string().max(100).optional().or(z.literal('')),
    accountNo: z.string().max(30).optional().or(z.literal('')),
    accountName: z.string().max(100).optional().or(z.literal('')),
    template: z.string().max(20).optional().or(z.literal('')),
});

/**
 * Main settings form validation schema
 */
export const settingsFormSchema = z.object({
    name: z.string().min(1, 'Restaurant name is required').max(200),
    tagline: z.string().max(500).optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    aboutTitle: z.string().max(200).optional().or(z.literal('')),
    aboutContent: z.string().optional().or(z.literal('')),
    address: z.string().max(500).optional().or(z.literal('')),
    phone: z.string().max(20).optional().or(z.literal('')),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    mapEmbedUrl: z.string().optional().or(z.literal('')),
    heroImage: z.string().max(500).optional().or(z.literal('')),
    aboutImage: z.string().max(500).optional().or(z.literal('')),
    logoUrl: z.string().max(500).optional().or(z.literal('')),
    operatingHours: z.array(operatingHoursSchema).optional(),
    socialLinks: z.array(socialLinkSchema).optional(),
    highlights: z.array(highlightSchema).optional(),
    bankConfig: bankConfigSchema.optional(),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
