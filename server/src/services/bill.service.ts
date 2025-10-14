import billRepository from '@/repositories/bill.repository';
import orderRepository from '@/repositories/order.repository';
import { NotFoundError, BadRequestError } from '@/utils/errors';
import { CreateBillDTO, ProcessPaymentDTO } from '@/validators';
import { Prisma } from '@prisma/client';

export class BillService {
    /**
     * Create bill from order
     */
    async createBill(data: CreateBillDTO, staffId?: number) {
        // Get order with items
        const order = await orderRepository.findById(data.orderId);
        if (!order) {
            throw new NotFoundError('Order not found');
        }

        if (order.status !== 'served') {
            throw new BadRequestError('Can only create bill for served orders');
        }

        // Check if bill already exists
        const existingBill = await billRepository.findByOrderId(order.orderId);
        if (existingBill) {
            throw new BadRequestError('Bill already exists for this order');
        }

        // Calculate bill totals
        const subtotal = order.orderItems.reduce(
            (sum, item) => sum + Number(item.subtotal),
            0
        );

        const taxRate = data.taxRate || 10; // Default 10%
        const taxAmount = (subtotal * taxRate) / 100;
        const discountAmount = data.discountAmount || 0;
        const serviceCharge = data.serviceCharge || 0;
        const totalAmount = subtotal + taxAmount + serviceCharge - discountAmount;

        // Create bill
        const billData: Prisma.BillCreateInput = {
            order: { connect: { orderId: order.orderId } },
            table: { connect: { tableId: order.tableId } },
            ...(staffId && { staff: { connect: { staffId } } }),
            subtotal,
            taxAmount,
            taxRate,
            discountAmount,
            serviceCharge,
            totalAmount,
            paidAmount: 0,
            changeAmount: 0,
            paymentStatus: 'pending',
        };

        const bill = await billRepository.create(billData);

        // Create bill items
        await Promise.all(
            order.orderItems.map((orderItem) =>
                billRepository.update(bill.billId, {
                    billItems: {
                        create: {
                            menuItem: { connect: { itemId: orderItem.itemId } },
                            itemName: orderItem.menuItem.itemName,
                            quantity: orderItem.quantity,
                            unitPrice: orderItem.unitPrice,
                            subtotal: orderItem.subtotal,
                            discount: 0,
                            total: orderItem.subtotal,
                        },
                    },
                })
            )
        );

        return billRepository.findById(bill.billId);
    }

    /**
     * Get bill by ID
     */
    async getBillById(billId: number) {
        const bill = await billRepository.findById(billId);
        if (!bill) {
            throw new NotFoundError('Bill not found');
        }
        return bill;
    }

    /**
     * Process payment
     */
    async processPayment(billId: number, data: ProcessPaymentDTO) {
        const bill = await this.getBillById(billId);

        if (bill.paymentStatus === 'paid') {
            throw new BadRequestError('Bill already paid');
        }

        return billRepository.processPayment(billId, {
            paymentMethod: data.paymentMethod,
            amount: data.paidAmount,
            transactionId: data.transactionId,
            cardNumber: data.cardNumber,
            cardHolderName: data.cardHolderName,
            notes: data.notes,
        });
    }

    /**
     * Get revenue statistics
     */
    async getRevenue(startDate?: string, endDate?: string) {
        const filters = {
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        };

        const totalRevenue = await billRepository.getTotalRevenue(filters);

        return {
            totalRevenue,
            period: {
                startDate: filters.startDate,
                endDate: filters.endDate,
            },
        };
    }
}

export default new BillService();
