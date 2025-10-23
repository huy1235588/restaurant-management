/**
 * Validation constants
 */

export const VALIDATION_RULES = {
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 100,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 50,
    EMAIL_MAX_LENGTH: 255,
    PHONE_MIN_LENGTH: 10,
    PHONE_MAX_LENGTH: 15,
} as const;

export const VALIDATION_MESSAGES = {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Invalid email format',
    INVALID_PHONE: 'Invalid phone number format',
    PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`,
    PASSWORD_TOO_LONG: `Password must not exceed ${VALIDATION_RULES.PASSWORD_MAX_LENGTH} characters`,
    USERNAME_TOO_SHORT: `Username must be at least ${VALIDATION_RULES.USERNAME_MIN_LENGTH} characters`,
    USERNAME_TOO_LONG: `Username must not exceed ${VALIDATION_RULES.USERNAME_MAX_LENGTH} characters`,
} as const;
