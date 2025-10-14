import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '@/utils/errors';
import AuthUtils from '@/utils/auth';
import { Role } from '@/types';

export interface AuthRequest extends Request {
    user?: {
        accountId: number;
        staffId?: number;
        username: string;
        role: Role;
    };
}

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.substring(7);
        const decoded = AuthUtils.verifyToken(token);

        req.user = decoded;
        next();
    } catch (error) {
        next(new UnauthorizedError('Invalid or expired token'));
    }
};

export const authorize = (...roles: Role[]) => {
    return (req: AuthRequest, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new UnauthorizedError('Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new ForbiddenError('You do not have permission to perform this action'));
        }

        next();
    };
};
