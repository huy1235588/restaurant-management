import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import config from '@config/index';
import { Role } from '@/types';

export interface TokenPayload {
    accountId: number;
    staffId?: number;
    username: string;
    role: Role;
}

export class AuthUtils {
    /**
     * Hash a password
     */
    static async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(12);
        return bcrypt.hash(password, salt);
    }

    /**
     * Compare password with hashed password
     */
    static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    /**
     * Generate JWT token
     */
    static generateToken(payload: TokenPayload, expiresIn: string): string {
        return jwt.sign(payload, config.jwtSecret, {
            expiresIn,
            issuer: 'restaurant-management',
            audience: 'restaurant-app',
        } as SignOptions);
    }

    /**
     * Verify JWT token
     */
    static verifyToken(token: string): TokenPayload {
        try {
            const decoded = jwt.verify(token, config.jwtSecret, {
                issuer: 'restaurant-management',
                audience: 'restaurant-app',
            }) as TokenPayload;
            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Token has expired');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid token');
            }
            throw new Error('Token verification failed');
        }
    }

    /**
     * Generate access and refresh tokens
     */
    static generateAuthTokens(payload: TokenPayload) {
        const accessToken = this.generateToken(payload, config.jwtExpiresIn);
        const refreshToken = this.generateToken(payload, config.jwtRefreshExpiresIn);
        return { accessToken, refreshToken };
    }

    /**
     * Get token expiration time in milliseconds
     */
    static getTokenExpirationMs(expiresIn: string): number {
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match) return 15 * 60 * 1000; // default 15 minutes

        const value = parseInt(match[1] || '15');
        const unit = match[2];

        switch (unit) {
            case 's':
                return value * 1000;
            case 'm':
                return value * 60 * 1000;
            case 'h':
                return value * 60 * 60 * 1000;
            case 'd':
                return value * 24 * 60 * 60 * 1000;
            default:
                return 15 * 60 * 1000;
        }
    }

    /**
     * Get token expiration date
     */
    static getTokenExpirationDate(expiresIn: string): Date {
        const ms = this.getTokenExpirationMs(expiresIn);
        return new Date(Date.now() + ms);
    }
}

export default AuthUtils;
