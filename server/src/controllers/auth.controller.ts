import { Request, Response, NextFunction } from 'express';
import authService from '@/services/auth.service';
import ResponseHandler from '@/utils/response';
import config from '@/config';
import { AuthRequest } from '@/middlewares/auth';

export class AuthController {
    /**
     * POST /api/auth/login
     */
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            // Get device info and IP
            const deviceInfo = req.headers['user-agent'];
            const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

            const result = await authService.login(req.body, deviceInfo, ipAddress);

            // Set secure cookie options
            const isProduction = config.nodeEnv === 'production';
            const cookieOptions = {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? ('strict' as const) : ('lax' as const),
                path: '/',
            };

            // Set access token cookie (short-lived)
            res.cookie('accessToken', result.accessToken, {
                ...cookieOptions,
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            // Set refresh token cookie (long-lived)
            res.cookie('refreshToken', result.refreshToken, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            // Return user info only (tokens are in cookies)
            // Access token also returned for client-side storage (optional)
            const responseData = {
                user: result.user,
                accessToken: result.accessToken, // For client to store in memory/sessionStorage
                // DO NOT return refreshToken - it's HttpOnly cookie only
            };

            ResponseHandler.success(res, 'Login successful', responseData);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/auth/me
     * Get current user info
     */
    async getMe(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }

            const user = await authService.getUserInfo(req.user.accountId);
            ResponseHandler.success(res, 'User info retrieved successfully', user);
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
            const refreshToken = req.cookies['refreshToken'] || req.body.refreshToken;
            if (!refreshToken) {
                throw new Error('No refresh token provided');
            }

            const result = await authService.refreshToken(refreshToken);

            // Set new access token cookie
            const isProduction = config.nodeEnv === 'production';
            res.cookie('accessToken', result.accessToken, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? ('strict' as const) : ('lax' as const),
                maxAge: 15 * 60 * 1000, // 15 minutes
                path: '/',
            });

            ResponseHandler.success(res, 'Token refreshed successfully', {
                accessToken: result.accessToken,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/logout
     */
    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies['refreshToken'];

            // Revoke refresh token
            await authService.logout(refreshToken);

            // Clear all auth cookies
            res.clearCookie('accessToken', { path: '/' });
            res.clearCookie('refreshToken', { path: '/' });

            ResponseHandler.success(res, 'Logout successful');
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/logout-all
     * Logout from all devices
     */
    async logoutAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not authenticated');
            }

            await authService.logoutAll(req.user.accountId);

            // Clear cookies
            res.clearCookie('accessToken', { path: '/' });
            res.clearCookie('refreshToken', { path: '/' });

            ResponseHandler.success(res, 'Logged out from all devices');
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();
