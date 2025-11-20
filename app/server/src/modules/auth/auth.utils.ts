import * as bcrypt from 'bcryptjs';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Role } from '@prisma/client';

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
    static async comparePassword(
        password: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    /**
     * Generate JWT token
     */
    static generateToken(
        jwtService: JwtService,
        payload: TokenPayload,
        expiresIn: string,
    ): string {
        return jwtService.sign(payload, {
            expiresIn,
            issuer: 'restaurant-management',
            audience: 'restaurant-app',
        } as JwtSignOptions);
    }

    /**
     * Generate access and refresh tokens
     */
    static generateAuthTokens(
        jwtService: JwtService,
        payload: TokenPayload,
        accessExpiresIn: string,
        refreshExpiresIn: string,
    ) {
        const accessToken = this.generateToken(
            jwtService,
            payload,
            accessExpiresIn,
        );
        const refreshToken = this.generateToken(
            jwtService,
            payload,
            refreshExpiresIn,
        );
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
