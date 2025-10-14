import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '@/utils/errors';
import AuthUtils, { TokenPayload } from '@/utils/auth';
import { Role } from '@/types';

export interface AuthRequest extends Request {
    user?: TokenPayload;
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header or cookie
 */
export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
        let token: string | undefined;

        // Check Authorization header first (priority)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }

        // If no token in header, check cookie
        if (!token) {
            token = req.cookies['accessToken'];
        }

        if (!token) {
            throw new UnauthorizedError('No authentication token provided');
        }

        // Verify token
        const decoded = AuthUtils.verifyToken(token);

        // Attach user info to request
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Token has expired') {
                return next(new UnauthorizedError('Token has expired. Please refresh your token.'));
            }
            if (error.message === 'Invalid token') {
                return next(new UnauthorizedError('Invalid authentication token'));
            }
        }
        next(new UnauthorizedError('Authentication failed'));
    }
};

/**
 * Authorization middleware
 * Checks if user has required role
 */
export const authorize = (...roles: Role[]) => {
    return (req: AuthRequest, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new UnauthorizedError('Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new ForbiddenError(
                    `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`
                )
            );
        }

        next();
    };
};

/**
 * Optional authentication middleware
 * Attaches user info if token is valid, but doesn't fail if no token
 */
export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
        let token: string | undefined;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }

        if (!token) {
            token = req.cookies['accessToken'];
        }

        if (token) {
            const decoded = AuthUtils.verifyToken(token);
            req.user = decoded;
        }
    } catch (error) {
        // Ignore errors for optional auth
    }
    next();
};
