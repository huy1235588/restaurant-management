import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '@config/index';

export class AuthUtils {
    /**
     * Hash a password
     */
    static async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
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
    static generateToken(payload: object, expiresIn?: string): string {
        return jwt.sign(payload, config.jwtSecret, {
            expiresIn: expiresIn || config.jwtExpiresIn,
        } as any);
    }

    /**
     * Verify JWT token
     */
    static verifyToken(token: string): any {
        try {
            return jwt.verify(token, config.jwtSecret);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    /**
     * Generate access and refresh tokens
     */
    static generateAuthTokens(payload: object) {
        const accessToken = this.generateToken(payload, config.jwtExpiresIn);
        const refreshToken = this.generateToken(payload, config.jwtRefreshExpiresIn);
        return { accessToken, refreshToken };
    }
}

export default AuthUtils;
