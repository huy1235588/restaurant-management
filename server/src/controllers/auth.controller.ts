import { Request, Response, NextFunction } from 'express';
import authService from '@/services/auth.service';
import ResponseHandler from '@/utils/response';

export class AuthController {
    /**
     * POST /api/auth/login
     */
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.login(req.body);
            ResponseHandler.success(res, 'Login successful', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/register
     */
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.register(req.body);
            ResponseHandler.created(res, 'Account created successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/staff
     */
    async createStaff(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.createStaff(req.body);
            ResponseHandler.created(res, 'Staff created successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/refresh
     */
    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            const result = await authService.refreshToken(refreshToken);
            ResponseHandler.success(res, 'Token refreshed successfully', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/logout
     */
    async logout(_req: Request, res: Response, next: NextFunction) {
        try {
            ResponseHandler.success(res, 'Logout successful');
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();
