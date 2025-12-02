import { Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { BillRepository, FindOptions } from './bill.repository';
import { PaymentRepository } from './payment.repository';
import { PrismaService } from '@/database/prisma.service';
import { CreateBillDto, ApplyDiscountDto, ProcessPaymentDto } from './dto';
import {
    PaymentStatus,
    OrderStatus,
    TableStatus,
} from '@/lib/prisma';
import { ConfigService } from '@nestjs/config';
import {
    BILLING_CONSTANTS,
    BILLING_MESSAGES,
} from './constants/billing.constants';
import {
    BillNotFoundException,
    BillAlreadyExistsException,
    OrderNotReadyForBillingException,
    BillNotPendingException,
    InvalidDiscountAmountException,
    DiscountExceedsSubtotalException,
    InvalidDiscountPercentageException,
    InvalidPaymentAmountException,
    InvalidPaymentMethodException,
} from './exceptions/billing.exceptions';
import { BillingHelper } from './helpers/billing.helper';
import { ReportsCacheService } from '../reports/reports-cache.service';
import { KitchenRepository } from '../kitchen/kitchen.repository';
import { KitchenGateway } from '../kitchen/kitchen.gateway';
import { SocketEmitterService } from '@/shared/websocket';

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
        @Inject(forwardRef(() => ReportsCacheService))
        private readonly reportsCacheService: ReportsCacheService,
        private readonly kitchenRepository: KitchenRepository,
        private readonly kitchenGateway: KitchenGateway,
        private readonly socketEmitter: SocketEmitterService,
    ) {
        this.TAX_RATE = this.configService.get<number>(
            'billing.taxRate',
            BILLING_CONSTANTS.DEFAULT_TAX_RATE,
        );
        this.SERVICE_RATE = this.configService.get<number>(
            'billing.serviceRate',
            BILLING_CONSTANTS.DEFAULT_SERVICE_RATE,
        );
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
            this.logger.warn(`Bill not found: ${billId}`);
            throw new BillNotFoundException(billId);
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
            this.logger.warn(
                `Order not found for bill creation: ${data.orderId}`,
            );
            throw new NotFoundException(BILLING_MESSAGES.ERROR.ORDER_NOT_FOUND);
        }

        // Check if order is ready for billing
        if (order.status !== OrderStatus.confirmed) {
            this.logger.warn(
                `Order ${data.orderId} not ready for billing. Status: ${order.status}`,
            );
            throw new OrderNotReadyForBillingException(
                data.orderId,
                order.status,
            );
        }

        // Check if bill already exists
        if (order.bill) {
            this.logger.warn(`Bill already exists for order ${data.orderId}`);
            throw new BillAlreadyExistsException(data.orderId);
        }

        // Calculate bill amounts using helper
        const subtotal = Number(order.totalAmount);
        const billSummary = BillingHelper.calculateBillSummary({
            subtotal,
            taxRate: this.TAX_RATE,
            serviceRate: this.SERVICE_RATE,
        });

        // Create bill in transaction
        const bill = await this.prisma.$transaction(async (tx) => {
            // Create bill
            const newBill = await tx.bill.create({
                data: {
                    orderId: data.orderId,
                    tableId: order.tableId,
                    staffId,
                    subtotal: billSummary.subtotal,
                    taxAmount: billSummary.taxAmount,
                    taxRate: billSummary.taxRate,
                    serviceCharge: billSummary.serviceCharge,
                    discountAmount: 0,
                    totalAmount: billSummary.totalAmount,
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
                        unitPrice: Number(orderItem.unitPrice),
                        subtotal: Number(orderItem.totalPrice),
                        discount: 0,
                        total: Number(orderItem.totalPrice),
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

        // Check if bill can be modified
        if (!BillingHelper.canModifyBill(bill.paymentStatus)) {
            this.logger.warn(
                `Cannot apply discount to bill ${billId} with status ${bill.paymentStatus}`,
            );
            throw new BillNotPendingException(billId, bill.paymentStatus);
        }

        let discountAmount = discountData.amount || 0;

        // Calculate percentage discount if provided
        if (discountData.percentage) {
            // Validate percentage
            if (
                !BillingHelper.isValidDiscountPercentage(
                    discountData.percentage,
                )
            ) {
                throw new InvalidDiscountPercentageException(
                    discountData.percentage,
                );
            }

            discountAmount = BillingHelper.calculateDiscountAmount(
                Number(bill.subtotal),
                discountData.percentage,
            );
        }

        // Validate discount amount
        if (
            !BillingHelper.isValidDiscountAmount(
                discountAmount,
                Number(bill.subtotal),
            )
        ) {
            if (discountAmount < 0) {
                throw new InvalidDiscountAmountException(
                    discountAmount,
                    Number(bill.subtotal),
                );
            }
            if (discountAmount > Number(bill.subtotal)) {
                throw new DiscountExceedsSubtotalException(
                    discountAmount,
                    Number(bill.subtotal),
                );
            }
        }

        // Check if discount requires manager approval
        const discountPercentage = BillingHelper.calculateDiscountPercentage(
            discountAmount,
            Number(bill.subtotal),
        );

        if (BillingHelper.requiresManagerApproval(discountPercentage)) {
            this.logger.warn(
                `Large discount applied: ${discountPercentage.toFixed(2)}% on bill ${bill.billNumber} by user ${userId}`,
            );
            // In production, this would trigger an approval workflow
        }

        // Recalculate total with discount using helper
        const newTotal = BillingHelper.calculateTotalAmount(
            Number(bill.subtotal),
            Number(bill.taxAmount),
            Number(bill.serviceCharge),
            discountAmount,
        );

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

        // Check if bill can accept payment
        if (!BillingHelper.isPending(bill.paymentStatus)) {
            this.logger.warn(
                `Cannot process payment for bill ${billId} with status ${bill.paymentStatus} and staff ${staffId}`,
            );
            throw new BillNotPendingException(billId, bill.paymentStatus);
        }

        // Validate payment method
        if (!BillingHelper.isValidPaymentMethod(paymentData.paymentMethod)) {
            throw new InvalidPaymentMethodException(
                paymentData.paymentMethod,
                BILLING_CONSTANTS.PAYMENT_METHODS,
            );
        }

        // Validate payment amount
        if (
            !BillingHelper.isValidPaymentAmount(
                paymentData.amount,
                Number(bill.totalAmount),
            )
        ) {
            throw new InvalidPaymentAmountException(
                paymentData.amount,
                Number(bill.totalAmount),
            );
        }

        // Calculate change using helper
        const changeAmount = BillingHelper.calculateChange(
            paymentData.amount,
            Number(bill.totalAmount),
        );

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

            // Delete kitchen order if exists (order is paid, no need to keep in kitchen display)
            await tx.kitchenOrder.deleteMany({
                where: { orderId: bill.orderId },
            });

            return { payment, bill: updatedBill };
        });

        this.logger.log(
            `Payment processed for bill ${bill.billNumber}: ${paymentData.paymentMethod} ${paymentData.amount}`,
        );

        // Emit payment completed event to all clients (including kitchen display)
        this.socketEmitter.emitPaymentCompleted({
            billId: result.bill.billId,
            orderId: bill.orderId,
            orderNumber: result.bill.order.orderNumber,
            totalAmount: Number(result.bill.totalAmount),
            tableId: bill.tableId,
        });

        // Also emit to kitchen namespace specifically
        this.kitchenGateway.emitOrderPaid({
            orderId: bill.orderId,
            orderNumber: result.bill.order.orderNumber,
        });

        this.logger.log(
            `Kitchen notified: Order #${result.bill.order.orderNumber} has been paid`,
        );

        // Invalidate reports cache after successful payment
        this.reportsCacheService.invalidateAllReportCaches();
        this.logger.debug('Reports cache invalidated after payment');

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

            // Update order status back to confirmed if bill was paid
            if (bill.paymentStatus === PaymentStatus.paid) {
                await tx.order.update({
                    where: { orderId: bill.orderId },
                    data: { status: OrderStatus.confirmed },
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
