/**
 * Application-wide constants
 */

export const APP_CONSTANTS = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
} as const;

export const TIME_CONSTANTS = {
    ONE_SECOND: 1000,
    ONE_MINUTE: 60 * 1000,
    ONE_HOUR: 60 * 60 * 1000,
    ONE_DAY: 24 * 60 * 60 * 1000,
} as const;

export const TOKEN_CONSTANTS = {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    REFRESH_TOKEN_CLEANUP_DAYS: 30,
} as const;
