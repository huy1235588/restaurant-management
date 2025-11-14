import { z } from 'zod';

// Layout Data schema
const tablePositionSchema = z.object({
    tableId: z.number().int().positive(),
    x: z.number(),
    y: z.number(),
    width: z.number().positive(),
    height: z.number().positive(),
    rotation: z.number().optional().default(0),
    shape: z.string().optional(),
});

const layoutDataSchema = z.object({
    tables: z.array(tablePositionSchema),
    gridSize: z.number().positive().optional().default(10),
    zoom: z.number().positive().optional().default(1),
}).passthrough();

// Create Layout schema
export const createFloorPlanLayoutSchema = z.object({
    floor: z
        .number()
        .int()
        .positive({ message: 'Floor must be a positive number' })
        .max(100, { message: 'Floor number is too high' }),
    name: z
        .string()
        .min(1, { message: 'Layout name is required' })
        .max(100, { message: 'Layout name is too long' })
        .trim(),
    description: z
        .string()
        .max(500, { message: 'Description is too long' })
        .optional()
        .nullable(),
    data: layoutDataSchema,
});

// Update Layout schema
export const updateFloorPlanLayoutSchema = z.object({
    name: z
        .string()
        .min(1)
        .max(100)
        .trim()
        .optional(),
    description: z
        .string()
        .max(500)
        .optional()
        .nullable(),
    data: layoutDataSchema.optional(),
});

// Create Background schema
export const createFloorPlanBackgroundSchema = z.object({
    floor: z
        .number()
        .int()
        .positive({ message: 'Floor must be a positive number' }),
    fileUrl: z
        .string()
        .url({ message: 'Invalid file URL' })
        .min(1, { message: 'File URL is required' }),
    fileName: z
        .string()
        .min(1, { message: 'File name is required' })
        .max(255),
    fileSize: z
        .number()
        .int()
        .positive({ message: 'File size must be positive' })
        .max(50 * 1024 * 1024, { message: 'File size cannot exceed 50MB' }),
    mimeType: z
        .string()
        .regex(/^image\/(jpeg|png|gif|webp)$/, { message: 'Invalid image type' }),
});

// Update Background schema
export const updateFloorPlanBackgroundSchema = z.object({
    fileUrl: z
        .string()
        .url()
        .optional(),
    fileName: z
        .string()
        .max(255)
        .optional(),
    fileSize: z
        .number()
        .int()
        .positive()
        .max(50 * 1024 * 1024)
        .optional(),
    mimeType: z
        .string()
        .regex(/^image\/(jpeg|png|gif|webp)$/)
        .optional(),
    opacity: z
        .number()
        .min(0)
        .max(1)
        .optional(),
    positionX: z.number().optional(),
    positionY: z.number().optional(),
    scaleX: z.number().positive().optional(),
    scaleY: z.number().positive().optional(),
});

// Get layouts by floor schema
export const getFloorPlanLayoutsByFloorSchema = z.object({
    floor: z
        .string()
        .transform(Number)
        .refine(n => Number.isInteger(n) && n > 0, { message: 'Invalid floor number' }),
});

// Get background schema
export const getFloorPlanBackgroundSchema = z.object({
    floor: z
        .string()
        .transform(Number)
        .refine(n => Number.isInteger(n) && n > 0, { message: 'Invalid floor number' }),
});

// Layout ID schema
export const floorPlanLayoutIdSchema = z.object({
    layoutId: z
        .string()
        .transform(Number)
        .refine(n => Number.isInteger(n) && n > 0, { message: 'Invalid layout ID' }),
});

// Background ID schema
export const floorPlanBackgroundIdSchema = z.object({
    backgroundId: z
        .string()
        .transform(Number)
        .refine(n => Number.isInteger(n) && n > 0, { message: 'Invalid background ID' }),
});
