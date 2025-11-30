import { z } from "zod";

// Create staff validation schema (link to existing account)
export const createStaffSchema = z.object({
    accountId: z
        .number({
            error: "Account is required",
        })
        .min(1, "Account is required"),
    fullName: z
        .string({
            error: "Full name is required",
        })
        .min(1, "Full name is required")
        .max(255, "Full name must be less than 255 characters"),
    address: z
        .string()
        .max(500, "Address must be less than 500 characters")
        .nullable()
        .optional(),
    dateOfBirth: z.string().nullable().optional(),
    hireDate: z.string().nullable().optional(),
    salary: z.number().min(0, "Salary must be positive").nullable().optional(),
    role: z.enum(["admin", "manager", "waiter", "chef", "cashier"], {
        error: "Role is required",
    }),
});

// Create staff with account validation schema (create new account + staff)
export const createStaffWithAccountSchema = z.object({
    // Account fields
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username must be less than 50 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z
        .string()
        .email("Invalid email address"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must be less than 100 characters"),
    phoneNumber: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be less than 15 digits")
        .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
    // Staff fields
    fullName: z
        .string()
        .min(1, "Full name is required")
        .max(255, "Full name must be less than 255 characters"),
    address: z
        .string()
        .max(500, "Address must be less than 500 characters")
        .nullable()
        .optional(),
    dateOfBirth: z.string().nullable().optional(),
    hireDate: z.string().nullable().optional(),
    salary: z.number().min(0, "Salary must be positive").nullable().optional(),
    role: z.enum(["admin", "manager", "waiter", "chef", "cashier"], {
        error: "Role is required",
    }),
});

// Update staff validation schema
export const updateStaffSchema = z.object({
    fullName: z
        .string()
        .min(1, "Full name is required")
        .max(255, "Full name must be less than 255 characters")
        .optional(),
    address: z
        .string()
        .max(500, "Address must be less than 500 characters")
        .nullable()
        .optional(),
    dateOfBirth: z.string().nullable().optional(),
    hireDate: z.string().nullable().optional(),
    salary: z.number().min(0, "Salary must be positive").nullable().optional(),
    role: z.enum(["admin", "manager", "waiter", "chef", "cashier"]).optional(),
});

// Change role validation schema
export const changeRoleSchema = z.object({
    role: z.enum(["admin", "manager", "waiter", "chef", "cashier"], {
        error: "Role is required",
    }),
});

export type CreateStaffFormValues = z.infer<typeof createStaffSchema>;
export type CreateStaffWithAccountFormValues = z.infer<typeof createStaffWithAccountSchema>;
export type UpdateStaffFormValues = z.infer<typeof updateStaffSchema>;
export type ChangeRoleFormValues = z.infer<typeof changeRoleSchema>;
