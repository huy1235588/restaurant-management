import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { BillRepository, FindOptions } from './bill.repository';
import { PaymentRepository } from './payment.repository';
import { PrismaService } from '@/database/prisma.service';
import { CreateBillDto, ApplyDiscountDto, ProcessPaymentDto } from './dto';
import { PaymentStatus, OrderStatus, TableStatus } from '@prisma/generated/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BillingService {
    private readonly logger = new Logger(BillingService.name);
    private readonly TAX_RATE: number;
    private readonly SERVICE_RATE: number;

    constructor(
        private readonly billRepository: BillRepository,
        private readonly paymentRepository: PaymentRepository,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        this.TAX_RATE = this.configService.get<number>('billing.taxRate', 0.1); // 10%
        this.SERVICE_RATE = this.configService.get<number>('billing.serviceRate', 0.05); // 5%
    }

    /**
     * Get all bills with pagination and filters
     */
    async getAllBills(options?: FindOptions) {
        return this.billRepository.findAllPaginated(options);
    }

    /**
     * Get bill by ID
     */
    async getBillById(billId: number) {
        const bill = await this.billRepository.findById(billId);

        if (!bill) {
            throw new NotFoundException('Bill not found');
        }

        return bill;
    }

    /**
     * Create bill from order
     */
    async createBill(data: CreateBillDto, staffId?: number) {
        // Get order and validate
        const order = await this.prisma.order.findUnique({
            where: { orderId: data.orderId },
            include: {
                table: true,
                orderItems: {
                    include: {
                        menuItem: true,
                    },
                },
                bill: true,
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Check if order is ready for billing
        if (order.status !== OrderStatus.ready && order.status !== OrderStatus.serving) {
            throw new BadRequestException(
                'Order must be ready or being served before creating bill',
            );
        }

        // Check if bill already exists
        if (order.bill) {
            throw new BadRequestException('Bill already exists for this order');
        }

        // Calculate bill amounts
        const subtotal = Number(order.totalAmount);
        const taxAmount = subtotal * this.TAX_RATE;
        const serviceCharge = subtotal * this.SERVICE_RATE;
        const totalAmount = subtotal + taxAmount + serviceCharge;

        // Create bill in transaction
        const bill = await this.prisma.$transaction(async (tx) => {
            // Create bill
            const newBill = await tx.bill.create({
                data: {
                    orderId: data.orderId,
                    tableId: order.tableId,
                    staffId,
                    subtotal,
                    taxAmount,
                    taxRate: this.TAX_RATE,
                    serviceCharge,
                    discountAmount: 0,
                    totalAmount,
                    paidAmount: 0,
                    changeAmount: 0,
                    paymentStatus: PaymentStatus.pending,
                },
                include: {
                    order: true,
                    table: true,
                },
            });

            // Create bill items from order items
            for (const orderItem of order.orderItems) {
                await tx.billItem.create({
                    data: {
                        billId: newBill.billId,
                        itemId: orderItem.itemId,
                        itemName: orderItem.menuItem.itemName,
                        quantity: orderItem.quantity,
                        unitPrice: orderItem.unitPrice,
                        subtotal: orderItem.totalPrice,
                        discount: 0,
                        total: orderItem.totalPrice,
                    },
                });
            }

            return newBill;
        });

        this.logger.log(
            `Bill created: ${bill.billNumber} for order ${order.orderNumber}`,
        );

        return this.getBillById(bill.billId);
    }

    /**
     * Apply discount to bill
     */
    async applyDiscount(
        billId: number,
        discountData: ApplyDiscountDto,
        userId?: number,
    ) {
        const bill = await this.getBillById(billId);

        if (bill.paymentStatus !== PaymentStatus.pending) {
            throw new BadRequestException('Can only apply discount to pending bills');
        }

        let discountAmount = discountData.amount;

        // Calculate percentage discount if provided
        if (discountData.percentage) {
            discountAmount = Number(bill.subtotal) * (discountData.percentage / 100);
        }

        // Validate discount amount
        if (discountAmount < 0) {
            throw new BadRequestException('Discount amount cannot be negative');
        }

        if (discountAmount > Number(bill.subtotal)) {
            throw new BadRequestException(
                'Discount amount cannot exceed subtotal',
            );
        }

        // Check if discount requires manager approval (>10%)
        const discountPercentage = (discountAmount / Number(bill.subtotal)) * 100;
        if (discountPercentage > 10) {
            this.logger.warn(
                `Large discount applied: ${discountPercentage.toFixed(2)}% on bill ${bill.billNumber} by user ${userId}`,
            );
            // In production, this would trigger an approval workflow
        }

        // Recalculate total with discount
        const newTotal =
            Number(bill.subtotal) +
            Number(bill.taxAmount) +
            Number(bill.serviceCharge) -
            discountAmount;

        const updated = await this.billRepository.update(billId, {
            discountAmount,
            totalAmount: newTotal,
            notes: bill.notes
                ? `${bill.notes}\nDiscount applied: ${discountData.reason}`
                : `Discount applied: ${discountData.reason}`,
        });

        this.logger.log(
            `Discount applied to bill ${bill.billNumber}: ${discountAmount} (${discountPercentage.toFixed(2)}%)`,
        );

        return updated;
    }

    /**
     * Process payment
     */
    async processPayment(
        billId: number,
        paymentData: ProcessPaymentDto,
        staffId?: number,
    ) {
        const bill = await this.getBillById(billId);

        if (bill.paymentStatus !== PaymentStatus.pending) {
            throw new BadRequestException('Bill is not pending payment');
        }

        // Validate payment amount equals total (no partial payments)
        if (paymentData.amount !== Number(bill.totalAmount)) {
            throw new BadRequestException(
                `Payment amount must equal total amount (${bill.totalAmount})`,
            );
        }

        // Calculate change (for cash payments)
        const changeAmount =
            paymentData.paymentMethod === 'cash'
                ? paymentData.amount - Number(bill.totalAmount)
                : 0;

        // Process payment in transaction
        const result = await this.prisma.$transaction(async (tx) => {
            // Create payment record
            const payment = await tx.payment.create({
                data: {
                    billId,
                    paymentMethod: paymentData.paymentMethod,
                    amount: paymentData.amount,
                    transactionId: paymentData.transactionId,
                    cardNumber: paymentData.cardNumber,
                    cardHolderName: paymentData.cardHolderName,
                    notes: paymentData.notes,
                    status: PaymentStatus.paid,
                },
            });

            // Update bill
            const updatedBill = await tx.bill.update({
                where: { billId },
                data: {
                    paidAmount: paymentData.amount,
                    changeAmount,
                    paymentStatus: PaymentStatus.paid,
                    paymentMethod: paymentData.paymentMethod,
                    paidAt: new Date(),
                },
                include: {
                    order: true,
                    table: true,
                    billItems: {
                        include: {
                            menuItem: true,
                        },
                    },
                    payments: true,
                },
            });

            // Update order status to completed
            await tx.order.update({
                where: { orderId: bill.orderId },
                data: {
                    status: OrderStatus.completed,
                    completedAt: new Date(),
                },
            });

            // Free up table
            await tx.restaurantTable.update({
                where: { tableId: bill.tableId },
                data: { status: TableStatus.available },
            });

            return { payment, bill: updatedBill };
        });

        this.logger.log(
            `Payment processed for bill ${bill.billNumber}: ${paymentData.paymentMethod} ${paymentData.amount}`,
        );

        return result;
    }

    /**
     * Void/delete bill (admin only)
     */
    async voidBill(billId: number, reason: string, userId?: number) {
        const bill = await this.getBillById(billId);

        // Log the void action
        this.logger.warn(
            `Bill ${bill.billNumber} voided by user ${userId} - Reason: ${reason}`,
        );

        // Delete in transaction
        const result = await this.prisma.$transaction(async (tx) => {
            // Delete payment records
            await tx.payment.deleteMany({
                where: { billId },
            });

            // Delete bill items
            await tx.billItem.deleteMany({
                where: { billId },
            });

            // Delete bill
            const deletedBill = await tx.bill.delete({
                where: { billId },
            });

            // Update order status back to ready if bill was paid
            if (bill.paymentStatus === PaymentStatus.paid) {
                await tx.order.update({
                    where: { orderId: bill.orderId },
                    data: { status: OrderStatus.ready },
                });

                // Update table status back to occupied
                await tx.restaurantTable.update({
                    where: { tableId: bill.tableId },
                    data: { status: TableStatus.occupied },
                });
            }

            return deletedBill;
        });

        return result;
    }
}
