import { prisma } from '@/config/database';
import { Prisma, Staff } from '@prisma/client';
import { Role } from '@/shared/types';
import { BaseFilter, BaseFindOptions, BaseRepository } from '@/shared';

interface StaffFilter extends BaseFilter {
    role?: Role;
    isActive?: boolean;
    createdAfter?: Date;
}

export class StaffRepository extends BaseRepository<Staff, StaffFilter> {
    protected buildWhereClause(filters?: StaffFilter): Prisma.StaffWhereInput {
        if (!filters) return {};

        const where: Prisma.StaffWhereInput = {};

        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        if (filters.role) {
            where.role = filters.role;
        }
        if (filters.createdAfter) {
            where.createdAt = { gte: filters.createdAfter };
        }
        if (filters.search) {
            where.OR = [
                { fullName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return where;
    }

    async findAll(options?: BaseFindOptions<StaffFilter>): Promise<Staff[]> {
        const { filters, skip = 0, take = 10, sortBy = 'fullName', sortOrder = 'asc' } = options || {};

        return prisma.staff.findMany({
            where: this.buildWhereClause(filters),
            include: { account: true },
            skip,
            take,
            orderBy: this.buildOrderBy(sortBy, sortOrder),
        });
    }

    async count(filters?: StaffFilter): Promise<number> {
        return prisma.staff.count({
            where: this.buildWhereClause(filters),
        });
    }

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
