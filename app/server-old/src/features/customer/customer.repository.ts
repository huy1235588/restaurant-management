import { prisma } from '@/config/database';
import { Prisma, Customer, Reservation } from '@prisma/client';
import { BaseRepository, BaseFindOptions, BaseFilter } from '@/shared/base';

interface CustomerFilter extends BaseFilter {
    search?: string;
    isVip?: boolean;
    phoneNumber?: string;
    email?: string;
}

export type CustomerWithRelations = Prisma.CustomerGetPayload<{
    include: { reservations: true };
}>;

export class CustomerRepository extends BaseRepository<Customer, CustomerFilter> {
    protected buildWhereClause(filters?: CustomerFilter): Prisma.CustomerWhereInput {
        if (!filters) {
            return {};
        }

        const { search, isVip, phoneNumber, email } = filters;
        const where: Prisma.CustomerWhereInput = {};

        if (typeof isVip === 'boolean') {
            where.isVip = isVip;
        }

        if (phoneNumber) {
            where.phoneNumber = { contains: phoneNumber, mode: 'insensitive' };
        }

        if (email) {
            where.email = { contains: email, mode: 'insensitive' };
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phoneNumber: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        return where;
    }

    async findAll(options?: BaseFindOptions<CustomerFilter>): Promise<Customer[]> {
        const { filters, skip = 0, take = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options || {};

        return prisma.customer.findMany({
            where: this.buildWhereClause(filters),
            skip,
            take,
            orderBy: this.buildOrderBy(sortBy, sortOrder) as Prisma.CustomerOrderByWithRelationInput,
        });
    }

    async count(filters?: CustomerFilter): Promise<number> {
        return prisma.customer.count({ where: this.buildWhereClause(filters) });
    }

    async findById(customerId: number): Promise<CustomerWithRelations | null> {
        return prisma.customer.findUnique({
            where: { customerId },
            include: {
                reservations: {
                    orderBy: [{ reservationDate: 'desc' }, { reservationTime: 'desc' }],
                    take: 10,
                },
            },
        });
    }

    async findByPhoneOrEmail(phoneNumber?: string, email?: string): Promise<Customer | null> {
        if (!phoneNumber && !email) {
            return null;
        }

        return prisma.customer.findFirst({
            where: {
                OR: [
                    ...(phoneNumber ? [{ phoneNumber: { equals: phoneNumber } }] : []),
                    ...(email ? [{ email: { equals: email } }] : []),
                ],
            },
        });
    }

    async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
        return prisma.customer.create({ data });
    }

    async update(customerId: number, data: Prisma.CustomerUpdateInput): Promise<Customer> {
        return prisma.customer.update({ where: { customerId }, data });
    }

    async search(term: string, limit: number = 10): Promise<Customer[]> {
        return prisma.customer.findMany({
            where: {
                OR: [
                    { name: { contains: term, mode: 'insensitive' } },
                    { phoneNumber: { contains: term, mode: 'insensitive' } },
                    { email: { contains: term, mode: 'insensitive' } },
                ],
            },
            take: limit,
            orderBy: { name: 'asc' },
        });
    }

    async getReservationHistory(customerId: number, limit = 50): Promise<Reservation[]> {
        return prisma.reservation.findMany({
            where: { customerId },
            include: { table: true },
            orderBy: [{ reservationDate: 'desc' }, { reservationTime: 'desc' }],
            take: limit,
        });
    }

    async reassignReservations(fromCustomerId: number, toCustomerId: number): Promise<number> {
        const result = await prisma.reservation.updateMany({
            where: { customerId: fromCustomerId },
            data: { customerId: toCustomerId },
        });
        return result.count;
    }

    async delete(customerId: number): Promise<Customer> {
        return prisma.customer.delete({ where: { customerId } });
    }
}

export default new CustomerRepository();
