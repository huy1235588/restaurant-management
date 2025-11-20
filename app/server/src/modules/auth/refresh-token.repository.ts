import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma } from '@prisma/generated/client';

@Injectable()
export class RefreshTokenRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Create a new refresh token
     */
    async create(data: Prisma.RefreshTokenCreateInput) {
        return this.prisma.refreshToken.create({ data });
    }

    /**
     * Find refresh token by token string
     */
    async findByToken(token: string) {
        return this.prisma.refreshToken.findFirst({
            where: {
                token,
                isRevoked: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                account: {
                    include: {
                        staff: true,
                    },
                },
            },
        });
    }

    /**
     * Find all refresh tokens by account ID
     */
    async findByAccountId(accountId: number) {
        return this.prisma.refreshToken.findMany({
            where: { accountId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Revoke a refresh token
     */
    async revoke(tokenId: number) {
        return this.prisma.refreshToken.update({
            where: { tokenId },
            data: {
                isRevoked: true,
                revokedAt: new Date(),
            },
        });
    }

    /**
     * Revoke all tokens for an account
     */
    async revokeAllByAccountId(accountId: number) {
        return this.prisma.refreshToken.updateMany({
            where: {
                accountId,
                isRevoked: false,
            },
            data: {
                isRevoked: true,
                revokedAt: new Date(),
            },
        });
    }

    /**
     * Delete expired tokens
     */
    async deleteExpired() {
        return this.prisma.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    }

    /**
     * Delete token by token string
     */
    async deleteByToken(token: string) {
        return this.prisma.refreshToken.deleteMany({
            where: { token },
        });
    }
}
