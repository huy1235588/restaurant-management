import { prisma } from '@/config/database';
import { Prisma } from '@prisma/client';

export class RefreshTokenRepository {
    /**
     * Create a new refresh token
     */
    async create(data: Prisma.RefreshTokenCreateInput) {
        return prisma.refreshToken.create({ data });
    }

    /**
     * Find refresh token by token string
     */
    async findByToken(token: string) {
        return prisma.refreshToken.findFirst({
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
        return prisma.refreshToken.findMany({
            where: { accountId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Revoke a refresh token
     */
    async revoke(tokenId: number) {
        return prisma.refreshToken.update({
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
        return prisma.refreshToken.updateMany({
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
        return prisma.refreshToken.deleteMany({
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
        return prisma.refreshToken.deleteMany({
            where: { token },
        });
    }
}

export default new RefreshTokenRepository();
