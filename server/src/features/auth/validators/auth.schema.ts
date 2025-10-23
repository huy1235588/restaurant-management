import { z } from 'zod';
import { VALIDATION_RULES, VALIDATION_MESSAGES } from '@/shared/constants';

export const loginSchema = z.object({
    username: z
        .string()
        .min(VALIDATION_RULES.USERNAME_MIN_LENGTH, { message: VALIDATION_MESSAGES.USERNAME_TOO_SHORT })
        .max(VALIDATION_RULES.USERNAME_MAX_LENGTH, { message: VALIDATION_MESSAGES.USERNAME_TOO_LONG }),
    password: z
        .string()
        .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH, { message: VALIDATION_MESSAGES.PASSWORD_TOO_SHORT })
        .max(VALIDATION_RULES.PASSWORD_MAX_LENGTH, { message: VALIDATION_MESSAGES.PASSWORD_TOO_LONG }),
});

export const registerSchema = z.object({
    username: z
        .string()
        .min(VALIDATION_RULES.USERNAME_MIN_LENGTH, { message: VALIDATION_MESSAGES.USERNAME_TOO_SHORT })
        .max(VALIDATION_RULES.USERNAME_MAX_LENGTH, { message: VALIDATION_MESSAGES.USERNAME_TOO_LONG }),
    email: z
        .email({ message: VALIDATION_MESSAGES.INVALID_EMAIL })
        .max(VALIDATION_RULES.EMAIL_MAX_LENGTH),
    password: z
        .string()
        .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH, { message: VALIDATION_MESSAGES.PASSWORD_TOO_SHORT })
        .max(VALIDATION_RULES.PASSWORD_MAX_LENGTH, { message: VALIDATION_MESSAGES.PASSWORD_TOO_LONG }),
    phoneNumber: z
        .string()
        .min(VALIDATION_RULES.PHONE_MIN_LENGTH, { message: VALIDATION_MESSAGES.INVALID_PHONE })
        .max(VALIDATION_RULES.PHONE_MAX_LENGTH, { message: VALIDATION_MESSAGES.INVALID_PHONE }),
    fullName: z.string().min(1, { message: VALIDATION_MESSAGES.REQUIRED_FIELD }),
    address: z.string().optional(),
    dateOfBirth: z.string().datetime().optional(),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, { message: VALIDATION_MESSAGES.REQUIRED_FIELD }),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, { message: VALIDATION_MESSAGES.REQUIRED_FIELD }),
    newPassword: z
        .string()
        .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH, { message: VALIDATION_MESSAGES.PASSWORD_TOO_SHORT })
        .max(VALIDATION_RULES.PASSWORD_MAX_LENGTH, { message: VALIDATION_MESSAGES.PASSWORD_TOO_LONG }),
});
