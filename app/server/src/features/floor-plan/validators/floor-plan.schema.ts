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

// Get layouts by floor schema
export const getFloorPlanLayoutsByFloorSchema = z.object({
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
