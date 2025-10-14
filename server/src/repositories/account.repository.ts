import { prisma } from '@/config/database';
import { Prisma, Account } from '@prisma/client';

export class AccountRepository {
    async create(data: Prisma.AccountCreateInput): Promise<Account> {
        return prisma.account.create({ data });
    }

    async findById(accountId: number): Promise<Account | null> {
        return prisma.account.findUnique({ where: { accountId } });
    }

    async findByUsername(username: string): Promise<Account | null> {
        return prisma.account.findUnique({ where: { username } });
    }

    async findByEmail(email: string): Promise<Account | null> {
        return prisma.account.findUnique({ where: { email } });
    }

    async findByPhoneNumber(phoneNumber: string): Promise<Account | null> {
        return prisma.account.findUnique({ where: { phoneNumber } });
    }

    async update(accountId: number, data: Prisma.AccountUpdateInput): Promise<Account> {
        return prisma.account.update({
            where: { accountId },
            data,
        });
    }

    async delete(accountId: number): Promise<Account> {
        return prisma.account.delete({ where: { accountId } });
    }

    async updateLastLogin(accountId: number): Promise<Account> {
        return prisma.account.update({
            where: { accountId },
            data: { lastLogin: new Date() },
        });
    }
}

export default new AccountRepository();
