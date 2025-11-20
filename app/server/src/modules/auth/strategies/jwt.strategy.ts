import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '@/database/prisma.service';
import { Role } from '@prisma/client';

export interface JwtPayload {
    accountId: number;
    staffId?: number;
    username: string;
    role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('JWT secret is not configured');
        }

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                // Extract from Authorization header (Bearer token)
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                // Extract from cookie
                (request: Request) => {
                    return request?.cookies?.['accessToken'] as string;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: secret,
            issuer: 'restaurant-management',
            audience: 'restaurant-app',
        });
    }

    async validate(payload: JwtPayload) {
        // Verify that the account still exists and is active
        const account = await this.prisma.account.findUnique({
            where: { accountId: payload.accountId },
            include: {
                staff: true,
            },
        });

        if (!account || !account.isActive) {
            throw new UnauthorizedException('Account is inactive or not found');
        }

        // Return user object that will be attached to request.user
        return {
            accountId: payload.accountId,
            staffId: payload.staffId,
            username: payload.username,
            role: payload.role,
        };
    }
}
