import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, Account } from '@prisma/client';

@Injectable()
export class AccountRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.AccountCreateInput): Promise<Account> {
        return this.prisma.account.create({ data });
    }

    async findById(accountId: number): Promise<Account | null> {
        return this.prisma.account.findUnique({ where: { accountId } });
    }

    async findByUsername(username: string): Promise<Account | null> {
        return this.prisma.account.findUnique({ where: { username } });
    }

    async findByEmail(email: string): Promise<Account | null> {
        return this.prisma.account.findUnique({ where: { email } });
    }

    async findByPhoneNumber(phoneNumber: string): Promise<Account | null> {
        return this.prisma.account.findUnique({ where: { phoneNumber } });
    }

    async update(
        accountId: number,
        data: Prisma.AccountUpdateInput,
    ): Promise<Account> {
        return this.prisma.account.update({
            where: { accountId },
            data,
        });
    }

    async delete(accountId: number): Promise<Account> {
        return this.prisma.account.delete({ where: { accountId } });
    }

    async updateLastLogin(accountId: number): Promise<Account> {
        return this.prisma.account.update({
            where: { accountId },
            data: { lastLogin: new Date() },
        });
    }
}
