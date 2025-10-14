import { prisma } from '@/config/database';
import { Prisma, Staff } from '@prisma/client';
import { Role } from '@/types';

export class StaffRepository {
    async create(data: Prisma.StaffCreateInput): Promise<Staff> {
        return prisma.staff.create({
            data,
            include: { account: true },
        });
    }

    async findById(staffId: number): Promise<Staff | null> {
        return prisma.staff.findUnique({
            where: { staffId },
            include: { account: true },
        });
    }

    async findByAccountId(accountId: number): Promise<Staff | null> {
        return prisma.staff.findUnique({
            where: { accountId },
            include: { account: true },
        });
    }

    async findAll(params?: {
        role?: Role;
        isActive?: boolean;
        skip?: number;
        take?: number;
    }): Promise<Staff[]> {
        const { role, isActive, skip, take } = params || {};
        return prisma.staff.findMany({
            where: {
                ...(role && { role }),
                ...(isActive !== undefined && { isActive }),
            },
            include: { account: true },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        });
    }

    async count(params?: { role?: Role; isActive?: boolean }): Promise<number> {
        const { role, isActive } = params || {};
        return prisma.staff.count({
            where: {
                ...(role && { role }),
                ...(isActive !== undefined && { isActive }),
            },
        });
    }

    async update(staffId: number, data: Prisma.StaffUpdateInput): Promise<Staff> {
        return prisma.staff.update({
            where: { staffId },
            data,
            include: { account: true },
        });
    }

    async delete(staffId: number): Promise<Staff> {
        return prisma.staff.delete({ where: { staffId } });
    }
}

export default new StaffRepository();
