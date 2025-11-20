import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, Staff, Role } from '@prisma/generated/client';

export interface StaffFilters {
    role?: Role;
    isActive?: boolean;
    search?: string;
}

export interface FindOptions {
    filters?: StaffFilters;
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class StaffRepository {
    constructor(private readonly prisma: PrismaService) {}

    private buildWhereClause(filters?: StaffFilters): Prisma.StaffWhereInput {
        if (!filters) return {};

        const where: Prisma.StaffWhereInput = {};

        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        if (filters.role) {
            where.role = filters.role;
        }
        if (filters.search) {
            where.OR = [
                { fullName: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return where;
    }

    private buildOrderBy(
        sortBy: string = 'fullName',
        sortOrder: 'asc' | 'desc' = 'asc',
    ): Prisma.StaffOrderByWithRelationInput {
        return { [sortBy]: sortOrder };
    }

    async findAll(options?: FindOptions): Promise<Staff[]> {
        const {
            filters,
            skip = 0,
            take = 10,
            sortBy = 'fullName',
            sortOrder = 'asc',
        } = options || {};

        return this.prisma.staff.findMany({
            where: this.buildWhereClause(filters),
            include: { account: true },
            skip,
            take,
            orderBy: this.buildOrderBy(sortBy, sortOrder),
        });
    }

    async count(filters?: StaffFilters): Promise<number> {
        return this.prisma.staff.count({
            where: this.buildWhereClause(filters),
        });
    }

    async create(data: Prisma.StaffCreateInput): Promise<Staff> {
        return this.prisma.staff.create({
            data,
            include: { account: true },
        });
    }

    async findById(staffId: number): Promise<Staff | null> {
        return this.prisma.staff.findUnique({
            where: { staffId },
            include: { account: true },
        });
    }

    async findByAccountId(accountId: number): Promise<Staff | null> {
        return this.prisma.staff.findUnique({
            where: { accountId },
            include: { account: true },
        });
    }

    async update(
        staffId: number,
        data: Prisma.StaffUpdateInput,
    ): Promise<Staff> {
        return this.prisma.staff.update({
            where: { staffId },
            data,
            include: { account: true },
        });
    }

    async delete(staffId: number): Promise<Staff> {
        return this.prisma.staff.delete({ where: { staffId } });
    }
}
