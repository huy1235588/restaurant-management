import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma, Payment } from '@/lib/prisma';

@Injectable()
export class PaymentRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByBillId(billId: number): Promise<Payment[]> {
        return this.prisma.payment.findMany({
            where: { billId },
            orderBy: {
                paymentDate: 'desc',
            },
        });
    }

    async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
        return this.prisma.payment.create({
            data,
        });
    }
}
