import { z } from 'zod';

// Update profile schema
export const updateProfileSchema = z.object({
    email: z
        .string()
        .email('Email không hợp lệ')
        .max(255, 'Email tối đa 255 ký tự')
        .optional()
        .or(z.literal('')),
    phoneNumber: z
        .string()
        .regex(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
        .max(20, 'Số điện thoại tối đa 20 ký tự')
        .optional()
        .or(z.literal('')),
    fullName: z
        .string()
        .max(255, 'Họ tên tối đa 255 ký tự')
        .optional()
        .or(z.literal('')),
    address: z
        .string()
        .max(500, 'Địa chỉ tối đa 500 ký tự')
        .optional()
        .or(z.literal('')),
});

// Change password schema
export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, 'Vui lòng nhập mật khẩu hiện tại'),
        newPassword: z
            .string()
            .min(6, 'Mật khẩu mới tối thiểu 6 ký tự'),
        confirmPassword: z
            .string()
            .min(1, 'Vui lòng xác nhận mật khẩu mới'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Mật khẩu không khớp',
        path: ['confirmPassword'],
    });

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
