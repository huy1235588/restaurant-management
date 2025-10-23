/**
 * Validation constants
 */

export const VALIDATION_RULES = {
    // Authentication
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 100,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 50,
    EMAIL_MAX_LENGTH: 255,
    PHONE_MIN_LENGTH: 10,
    PHONE_MAX_LENGTH: 15,
    
    // Menu & Category
    ITEM_NAME_MIN_LENGTH: 1,
    ITEM_NAME_MAX_LENGTH: 100,
    ITEM_CODE_MIN_LENGTH: 1,
    ITEM_CODE_MAX_LENGTH: 20,
    CATEGORY_NAME_MIN_LENGTH: 1,
    CATEGORY_NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 1000,
    PRICE_MIN: 0,
    PRICE_MAX: 99999999.99,
    
    // Table
    TABLE_NUMBER_MIN_LENGTH: 1,
    TABLE_NUMBER_MAX_LENGTH: 20,
    TABLE_NAME_MAX_LENGTH: 50,
    CAPACITY_MIN: 1,
    CAPACITY_MAX: 50,
    
    // Reservation
    CUSTOMER_NAME_MIN_LENGTH: 1,
    CUSTOMER_NAME_MAX_LENGTH: 255,
    HEADCOUNT_MIN: 1,
    HEADCOUNT_MAX: 50,
    DURATION_MIN: 30,
    DURATION_MAX: 480,
    
    // Staff
    FULL_NAME_MIN_LENGTH: 1,
    FULL_NAME_MAX_LENGTH: 255,
    ADDRESS_MAX_LENGTH: 500,
    SALARY_MIN: 0,
    SALARY_MAX: 999999999.99,
} as const;

export const VALIDATION_MESSAGES = {
    // General
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Invalid email format',
    INVALID_PHONE: 'Invalid phone number format',
    INVALID_DATE: 'Invalid date format',
    INVALID_NUMBER: 'Must be a valid number',
    INVALID_POSITIVE_NUMBER: 'Must be a positive number',
    
    // Authentication
    PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`,
    PASSWORD_TOO_LONG: `Password must not exceed ${VALIDATION_RULES.PASSWORD_MAX_LENGTH} characters`,
    USERNAME_TOO_SHORT: `Username must be at least ${VALIDATION_RULES.USERNAME_MIN_LENGTH} characters`,
    USERNAME_TOO_LONG: `Username must not exceed ${VALIDATION_RULES.USERNAME_MAX_LENGTH} characters`,
    
    // Menu & Category
    ITEM_NAME_REQUIRED: 'Item name is required',
    ITEM_CODE_REQUIRED: 'Item code is required',
    CATEGORY_NAME_REQUIRED: 'Category name is required',
    PRICE_REQUIRED: 'Price is required',
    PRICE_INVALID: 'Price must be a positive number',
    
    // Table
    TABLE_NUMBER_REQUIRED: 'Table number is required',
    CAPACITY_REQUIRED: 'Capacity is required',
    CAPACITY_INVALID: 'Capacity must be at least 1',
    
    // Reservation
    CUSTOMER_NAME_REQUIRED: 'Customer name is required',
    RESERVATION_DATE_REQUIRED: 'Reservation date is required',
    RESERVATION_TIME_REQUIRED: 'Reservation time is required',
    HEADCOUNT_REQUIRED: 'Head count is required',
    HEADCOUNT_INVALID: 'Head count must be at least 1',
    
    // Staff
    FULL_NAME_REQUIRED: 'Full name is required',
    ROLE_REQUIRED: 'Role is required',
    ROLE_INVALID: 'Invalid role',
} as const;
